/**
 * @fileoverview CustomFormField - Generic form field component for standard forms
 *
 * This component provides a type-safe, reusable form field that automatically
 * renders the appropriate input based on the fieldType prop. Ideal for general
 * form usage outside of data tables.
 *
 * @module CustomFormField
 *
 * Key Features:
 * - Type-safe with TypeScript generics
 * - Multiple input variants (text, textarea, checkbox, switch, date, dateRange, select, multiSelect)
 * - Consistent styling with floating labels
 * - Built-in validation support via react-hook-form
 * - Accessibility-ready with ARIA attributes
 * - Easy to extend with new field types
 *
 * @example Basic Usage
 * ```tsx
 * import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
 *
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.INPUT}
 *   name="email"
 *   label="Email Address"
 *   placeholder="Enter your email"
 *   inputType="email"
 *   inputMode="email"
 *   required
 * />
 * ```
 *
 * @example Select Field
 * ```tsx
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.SELECT}
 *   name="status"
 *   label="Status"
 *   placeholder="Select status"
 * >
 *   <SelectItem value="active">Active</SelectItem>
 *   <SelectItem value="inactive">Inactive</SelectItem>
 * </CustomFormField>
 * ```
 *
 * @example Multi-Select Field
 * ```tsx
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.MULTI_SELECT}
 *   name="tags"
 *   label="Tags"
 *   placeholder="Select tags"
 *   options={[
 *     { value: "tag1", label: "Tag 1" },
 *     { value: "tag2", label: "Tag 2" },
 *   ]}
 * />
 * ```
 *
 * @example Date Range Field
 * ```tsx
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.DATE_RANGE}
 *   name="dateRange"
 *   label="Date Range"
 *   placeholder="Select date range"
 *   fromMonth={new Date(2020, 0)}
 *   toMonth={new Date(2025, 11)}
 * />
 * ```
 *
 * @see {@link FormFieldType} for supported field types
 * @see {@link CustomFormFieldProps} for component props
 */
"use client";

import React from "react";
import {
  Control,
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import { format } from "date-fns";

// UI Components
import { Checkbox } from "./ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Switch } from "./ui/switch";
import MultipleSelector, { Option } from "./ui/multi-select";
import { DateRange } from "react-day-picker";

// Utils
import { cn } from "@/lib/utils";
import { Icons } from "./shared/icons";

/**
 * Enum defining all supported form field types
 */
export enum FormFieldType {
  /** Standard text input */
  INPUT = "input",
  /** Multi-line text area */
  TEXTAREA = "textarea",
  /** Toggle switch for boolean values */
  SWITCH = "switch",
  /** Checkbox input for boolean values */
  CHECKBOX = "checkbox",
  /** Date picker with calendar UI */
  DATE_PICKER = "datePicker",
  /** Date range picker with calendar UI */
  DATE_RANGE = "dateRange",
  /** Single select dropdown */
  SELECT = "select",
  /** Multi-select dropdown with tags */
  MULTI_SELECT = "multiSelect",
  /** Custom skeleton renderer for special cases */
  SKELETON = "skeleton",
}

/**
 * Input mode types for better mobile keyboard experience
 */
export type InputMode =
  | "search"
  | "text"
  | "email"
  | "tel"
  | "url"
  | "none"
  | "numeric"
  | "decimal";

/**
 * Props for CustomFormField component
 *
 * @template TFieldValues - The type of the form values (from react-hook-form)
 */
export interface CustomFormFieldProps<TFieldValues extends FieldValues = any> {
  /** React Hook Form control object */
  control: Control<TFieldValues>;
  /** Field name (must match form schema key) */
  name: string;
  /** Display label for the field */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Icon to display (typically on the left side of input) */
  iconSrc?: React.ReactNode;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Date format string (for date picker) */
  dateFormat?: string;
  /** Minimum selectable month (for date picker) */
  fromMonth?: Date;
  /** Maximum selectable month (for date picker) */
  toMonth?: Date;
  /** Show time selection (for date picker) */
  showTimeSelect?: boolean;
  /** Children elements (for SELECT field type) */
  children?: React.ReactNode;
  /** Options for MULTI_SELECT field type */
  options?: Option[];
  /** Custom render function (for SKELETON field type) */
  renderSkeleton?: (
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>,
  ) => React.ReactNode;
  /** Type of form field to render */
  fieldType: FormFieldType;
  /** Additional CSS classes for the FormItem wrapper */
  className?: string;
  /** Additional CSS classes for the input field itself */
  fieldClassName?: string;
  /** HTML input type attribute (text, email, password, etc.) */
  inputType?: React.HTMLInputTypeAttribute;
  /** Input mode for mobile keyboards */
  inputMode?: InputMode;
}

/**
 * Props for RenderInput internal component
 */
interface RenderInputProps<TFieldValues extends FieldValues = any> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  props: CustomFormFieldProps<TFieldValues>;
}

/**
 * Internal component that renders the appropriate input based on field type
 */
const RenderInput = <TFieldValues extends FieldValues = any>({
  field,
  props,
}: RenderInputProps<TFieldValues>): React.ReactElement | null => {
  switch (props.fieldType) {
    case FormFieldType.INPUT: {
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
                const value = e.target.value;
                // Transform value based on input mode
                const transformedValue =
                  props.inputMode === "numeric" ? Number(value) : value;
                field.onChange(transformedValue);
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
              aria-label={props.label || props.placeholder}
            />
          </div>
        </FormControl>
      );
    }
    case FormFieldType.TEXTAREA: {
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            disabled={props.disabled}
            required={props.required}
            className={props.fieldClassName}
            aria-label={props.label || props.placeholder}
          />
        </FormControl>
      );
    }

    case FormFieldType.CHECKBOX: {
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value as boolean}
              required={props.required}
              onCheckedChange={field.onChange}
              aria-label={props.label}
            />
            <label htmlFor={props.name} className="checkbox-label">
              {props.label}
            </label>
          </div>
        </FormControl>
      );
    }
    case FormFieldType.SWITCH: {
      return (
        <div className="flex h-10 flex-row items-center justify-center rounded-lg border px-2">
          <FormControl>
            <Switch
              checked={field.value as boolean}
              onCheckedChange={field.onChange}
              aria-label={props.label}
            />
          </FormControl>
        </div>
      );
    }

    case FormFieldType.DATE_PICKER: {
      const dateValue = field.value as Date | undefined;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground",
                )}
                aria-label={props.label || "Select date"}
              >
                <Icons.calendar className="mr-2 size-4" />
                {dateValue ? (
                  format(dateValue, props.dateFormat || "PP")
                ) : (
                  <span>{props.placeholder || "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                className="rounded-xs border shadow-sm w-56"
                captionLayout="dropdown"
                selected={dateValue}
                onSelect={(date?: Date) => field.onChange(date)}
                defaultMonth={dateValue}
                startMonth={props.fromMonth}
                endMonth={props.toMonth}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    case FormFieldType.DATE_RANGE: {
      const dateRangeValue = field.value as
        | [Date | undefined, Date | undefined]
        | undefined;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRangeValue && "text-muted-foreground",
                )}
                aria-label={props.label || "Select date range"}
              >
                <Icons.calendar className="mr-2 size-4" />
                {dateRangeValue?.[0] ? (
                  dateRangeValue?.[1] ? (
                    <>
                      {format(dateRangeValue[0], "LLL dd, y")} -{" "}
                      {format(dateRangeValue[1], "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRangeValue[0], "LLL dd, y")
                  )
                ) : (
                  <span>{props.placeholder || "Pick a date range"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                className="rounded-xs border shadow-sm w-96"
                defaultMonth={dateRangeValue?.[0]}
                selected={{
                  from: dateRangeValue?.[0],
                  to: dateRangeValue?.[1],
                }}
                onSelect={(dateRange?: DateRange) => {
                  const newRange: [Date | undefined, Date | undefined] = [
                    dateRange?.from,
                    dateRange?.to,
                  ];
                  field.onChange(newRange);
                }}
                numberOfMonths={2}
                startMonth={props.fromMonth}
                endMonth={props.toMonth}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }
    case FormFieldType.SELECT: {
      const selectValue = field.value as string | undefined;
      return (
        <FormControl>
          <Select
            onValueChange={field.onChange}
            defaultValue={selectValue}
            required={props.required}
            disabled={props.disabled}
          >
            <FormControl>
              <SelectTrigger aria-label={props.label || "Select option"}>
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{props.children}</SelectContent>
          </Select>
        </FormControl>
      );
    }

    case FormFieldType.MULTI_SELECT: {
      const optionValue = (field.value as Option[]) ?? [];
      const options = props.options ?? [];
      return (
        <div className="flex flex-row items-center justify-between gap-1">
          <MultipleSelector
            className="w-full"
            onChange={(selectedOptions) => {
              field.onChange(selectedOptions);
            }}
            placeholder={props.placeholder || "Select multiple..."}
            value={optionValue}
            options={options}
            disabled={props.disabled}
            commandProps={{
              filter: (value, search) => {
                const option = options.find((o) => o.value === value);
                return option?.label
                  ?.toLowerCase()
                  .includes(search.toLowerCase())
                  ? 1
                  : 0;
              },
            }}
            aria-label={props.label || "Select multiple"}
          />
        </div>
      );
    }

    case FormFieldType.SKELETON: {
      if (!props.renderSkeleton) return null;
      const result = props.renderSkeleton(field);
      return result as React.ReactElement | null;
    }

    default:
      return null;
  }
};

/**
 * CustomFormField - Generic form field component for standard forms
 *
 * Automatically renders the appropriate input type based on the fieldType prop.
 * Supports validation, error messages, and accessibility features out of the box.
 *
 * @template TFieldValues - The type of the form values (from react-hook-form)
 *
 * @example
 * ```tsx
 * // Text input
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.INPUT}
 *   name="username"
 *   label="Username"
 *   placeholder="Enter username"
 *   required
 * />
 *
 * // Date picker
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.DATE_PICKER}
 *   name="birthDate"
 *   label="Birth Date"
 *   fromMonth={new Date(1900, 0)}
 *   toMonth={new Date()}
 * />
 *
 * // Select dropdown
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.SELECT}
 *   name="role"
 *   label="Role"
 *   placeholder="Select role"
 * >
 *   <SelectItem value="admin">Admin</SelectItem>
 *   <SelectItem value="user">User</SelectItem>
 * </CustomFormField>
 *
 * // Multi-select
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.MULTI_SELECT}
 *   name="categories"
 *   label="Categories"
 *   placeholder="Select categories"
 *   options={[
 *     { value: "tech", label: "Technology" },
 *     { value: "health", label: "Health" },
 *   ]}
 * />
 *
 * // Date range
 * <CustomFormField
 *   control={form.control}
 *   fieldType={FormFieldType.DATE_RANGE}
 *   name="projectDuration"
 *   label="Project Duration"
 *   placeholder="Select date range"
 * />
 * ```
 */
const CustomFormField = <TFieldValues extends FieldValues = any>(
  props: CustomFormFieldProps<TFieldValues>,
) => {
  const { control, name, label, className } = props;

  return (
    <FormField
      control={control}
      name={name as Path<TFieldValues>}
      render={({ field }) => (
        <FormItem className={cn("relative flex-1", className)}>
          <RenderInput<TFieldValues> field={field} props={props} />
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
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
};

export default CustomFormField;
