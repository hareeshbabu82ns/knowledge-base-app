/**
 * @fileoverview Generic Custom Form Field component for DataTable row editing
 *
 * This component provides a type-safe, extensible form field that automatically
 * renders the appropriate input based on column metadata. It supports multiple
 * input variants including text, number, date, select, and more.
 *
 * @module DatatableCustomFormField
 *
 * Key Features:
 * - Type-safe with TypeScript generics
 * - Automatic option fetching for select-based inputs
 * - Conditional query enabling to prevent unnecessary loading states
 * - Error handling with user-friendly messages
 * - Easy to extend with new input variants
 *
 * @example Basic Usage
 * ```tsx
 * // In your column definition
 * const columns: ColumnDef<YourDataType>[] = [
 *   {
 *     accessorKey: "status",
 *     header: "Status",
 *     meta: {
 *       cellInputVariant: "select",
 *       fieldType: "string",
 *       filterOptions: [
 *         { value: "active", label: "Active" },
 *         { value: "inactive", label: "Inactive" }
 *       ]
 *     }
 *   }
 * ];
 *
 * // In your row edit form
 * <DatatableCustomFormField
 *   column={column}
 *   control={form.control}
 *   name="status"
 *   label="Status"
 *   placeholder="Select status"
 *   required
 * />
 * ```
 *
 * @example With Async Options
 * ```tsx
 * meta: {
 *   cellInputVariant: "multiSelect",
 *   fieldType: "array",
 *   filterOptionsFn: async () => {
 *     const response = await fetch('/api/categories');
 *     return response.json();
 *   }
 * }
 * ```
 *
 * @example Adding a New Variant
 * 1. Add variant to InputVariant type: `| "yourVariant"`
 * 2. If it needs options, add to needsOptionsVariants array
 * 3. Add case in RenderInput switch statement
 * 4. Define your custom rendering logic
 *
 * @see {@link InputVariant} for supported input types
 * @see {@link CustomFormFieldProps} for component props
 * @see {@link ColumnMeta} for column metadata structure
 */
"use client";

import React, { useCallback } from "react";
import {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Column } from "@tanstack/react-table";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

// UI Components
import { Checkbox } from "../ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Switch } from "../ui/switch";
import MultipleSelector, { Option } from "../ui/multi-select";
import { Alert, AlertDescription } from "../ui/alert";

// Utils
import { cn } from "@/lib/utils";
import { Icons } from "../shared/icons";

/**
 * Supported input variant types for the custom form field
 */
export type InputVariant =
  | "text"
  | "number"
  | "textArea"
  | "checkbox"
  | "switch"
  | "date"
  | "dateRange"
  | "select"
  | "multiSelect"
  | "range"
  | "skeleton";

/**
 * Field type metadata for special handling
 */
export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "array"
  | "subObject";

/**
 * Configuration for variants that need to fetch options
 */
interface OptionConfig {
  filterOptions?: Option[];
  filterOptionsFn?: () => Promise<Option[] | undefined> | Option[] | undefined;
}

/**
 * Props for the custom form field component
 */
interface CustomFormFieldProps<TData, TFieldValues extends FieldValues = any> {
  column: Column<TData, unknown>;
  control: Control<TFieldValues>;
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  iconSrc?: React.ReactNode;
  className?: string;
  fieldClassName?: string;
  inputType?: React.HTMLInputTypeAttribute;
  inputMode?:
    | "search"
    | "text"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  dateFormat?: string;
  fromMonth?: Date;
  toMonth?: Date;
  renderSkeleton?: (
    field: ControllerRenderProps<TFieldValues, any>,
  ) => React.ReactNode;
}

/**
 * Column metadata structure
 */
interface ColumnMeta extends OptionConfig {
  cellInputVariant?: InputVariant;
  fieldType?: FieldType;
  dbMapId?: string;
  subObjectLabelField?: string;
}

/**
 * Checks if an input variant requires fetching options
 */
const needsOptionsVariants: InputVariant[] = ["select", "multiSelect"];

const isOptionsBasedVariant = (variant?: InputVariant): boolean => {
  return !!variant && needsOptionsVariants.includes(variant);
};

/**
 * Generates select items from filter options
 */
const generateFilterOptions = (
  filterOptions?: Option[],
): React.ReactElement[] | null => {
  if (!filterOptions || filterOptions.length === 0) return null;

  return filterOptions.map(({ value, label }) => (
    <SelectItem key={value} value={value}>
      <div className="flex cursor-pointer items-center gap-2">
        <p>{label}</p>
      </div>
    </SelectItem>
  ));
};

/**
 * Hook to fetch options for select-based inputs
 */
const useFieldOptions = (
  columnId: string,
  meta?: ColumnMeta,
): {
  isLoading: boolean;
  isError: boolean;
  options: Option[];
  error: Error | null;
} => {
  const variant = meta?.cellInputVariant;
  const needsOptions = isOptionsBasedVariant(variant);

  // Memoize query function
  const queryFn = useCallback(async (): Promise<Option[]> => {
    if (meta?.filterOptionsFn) {
      const result = await meta.filterOptionsFn();
      return result ?? [];
    } else if (meta?.filterOptions) {
      return meta.filterOptions;
    }
    return [];
  }, [meta?.filterOptionsFn, meta?.filterOptions]);

  const {
    isLoading,
    isPending,
    isError,
    data: options = [],
    error,
  } = useQuery<Option[], Error>({
    queryKey: ["formFieldOptions", columnId],
    queryFn,
    enabled: needsOptions && !!(meta?.filterOptionsFn || meta?.filterOptions),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    isLoading: needsOptions && (isLoading || isPending),
    isError: needsOptions && isError,
    options,
    error: error || null,
  };
};

/**
 * Renders the appropriate input based on the variant type
 */
function RenderInput<TData, TFieldValues extends FieldValues = any>({
  field,
  props,
  options,
  isLoading,
  isError,
  error,
}: {
  field: ControllerRenderProps<TFieldValues, any>;
  props: CustomFormFieldProps<TData, TFieldValues>;
  options: Option[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}) {
  const meta = props.column.columnDef.meta as ColumnMeta | undefined;
  const cellInputVariant = meta?.cellInputVariant;
  const fieldType = meta?.fieldType;

  // Loading state for options-based inputs
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Icons.spinner className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state for options-based inputs
  if (isError) {
    return (
      <Alert variant="destructive" className="p-2">
        <AlertDescription className="text-xs">
          {error?.message || "Failed to load options"}
        </AlertDescription>
      </Alert>
    );
  }

  switch (cellInputVariant) {
    case "number":
    case "text":
      return (
        <FormControl>
          <div className="relative">
            {props.iconSrc && (
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2">
                {props.iconSrc}
              </div>
            )}
            <Input
              placeholder={props.placeholder}
              {...field}
              onChange={(e) => {
                if (cellInputVariant === "number") {
                  const val = Number(e.target.value);
                  if (isNaN(val)) return;
                  field.onChange(e.target.value);
                } else if (fieldType === "array") {
                  field.onChange(e.target.value.split(","));
                } else {
                  field.onChange(e.target.value);
                }
              }}
              type={props.inputType}
              inputMode={props.inputMode}
              required={props.required}
              disabled={props.disabled}
              className={cn(
                "peer",
                props.iconSrc ? "p-2.5 ps-10" : "",
                props.fieldClassName,
              )}
            />
          </div>
        </FormControl>
      );
    case "textArea":
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            disabled={props.disabled}
            required={props.required}
            className={props.fieldClassName}
          />
        </FormControl>
      );
    // case FormFieldType.PHONE_INPUT:
    //   return (
    //     <FormControl>
    //       <PhoneInput
    //         defaultCountry="US"
    //         placeholder={props.placeholder}
    //         international
    //         withCountryCallingCode
    //         value={field.value as E164Number | undefined}
    //         onChange={field.onChange}
    //         className="input-phone"
    //       />
    //     </FormControl>
    //   );
    case "checkbox":
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value}
              required={props.required}
              onCheckedChange={field.onChange}
            />
            <label htmlFor={props.name} className="checkbox-label">
              {props.label}
            </label>
          </div>
        </FormControl>
      );
    case "date":
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground",
                )}
              >
                <Icons.calendar className="mr-2 size-4" />
                {field.value ? (
                  format(field.value, "PP")
                ) : (
                  <span>{props.placeholder || "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                className="rounded-xs border shadow-sm w-56"
                captionLayout="dropdown"
                selected={field.value}
                onSelect={(date?: Date) => field.onChange(date)}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    case "switch":
      return (
        <div className="flex h-10 flex-row items-center justify-center rounded-lg border">
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </div>
      );
    case "select":
      return (
        <FormControl>
          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
            required={props.required}
            disabled={props.disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>{generateFilterOptions(options)}</SelectContent>
          </Select>
        </FormControl>
      );
    case "multiSelect":
      return (
        <FormControl>
          <MultipleSelector
            className="w-full"
            onChange={(v) => {
              field.onChange(v.map((i) => i.value));
            }}
            placeholder={props.placeholder}
            value={
              field.value?.map((i: string) =>
                options?.find((o) => o.value === i),
              ) || []
            }
            options={options}
            commandProps={{
              filter: (value, search, keywords) => {
                return options
                  ?.find((o) => o.value === value)
                  ?.label?.toLowerCase()
                  .includes(search.toLowerCase())
                  ? 1
                  : 0;
              },
            }}
          />
        </FormControl>
      );
    case "skeleton":
      return props.renderSkeleton ? props.renderSkeleton(field) : null;
    default:
      return null;
  }
}

/**
 * Generic form field component for data table row editing
 *
 * @example
 * ```tsx
 * <DatatableCustomFormField
 *   column={column}
 *   control={form.control}
 *   name="fieldName"
 *   label="Field Label"
 *   placeholder="Enter value"
 *   required
 * />
 * ```
 *
 * To add a new input variant:
 * 1. Add the variant to the InputVariant type union
 * 2. If it needs options, add to needsOptionsVariants array
 * 3. Add a case to the switch statement in RenderInput
 * 4. Define column meta with cellInputVariant and fieldType
 */
function DatatableCustomFormField<
  TData,
  TFieldValues extends FieldValues = any,
>(props: CustomFormFieldProps<TData, TFieldValues>) {
  const { control, name, label, className, column } = props;
  const meta = column.columnDef.meta as ColumnMeta | undefined;

  // Fetch options if needed for this variant
  const { isLoading, isError, options, error } = useFieldOptions(
    column.id,
    meta,
  );

  return (
    <FormField
      control={control}
      name={name as Path<TFieldValues>}
      render={({ field }) => (
        <FormItem className={cn("relative flex-1", className)}>
          <RenderInput
            field={field}
            props={props}
            options={options}
            isLoading={isLoading}
            isError={isError}
            error={error}
          />
          {meta?.cellInputVariant !== "checkbox" && label && (
            <FormLabel
              className="bg-background absolute start-1 top-2 z-10 origin-left -translate-y-6 scale-90 px-1 duration-300"
              htmlFor={name}
            >
              {label}
              {props.required && " *"}
            </FormLabel>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default DatatableCustomFormField;
