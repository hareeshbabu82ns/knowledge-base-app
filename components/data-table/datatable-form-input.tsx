/**
 * @fileoverview DataTableFormInput - Form input component for editable table cells
 *
 * This component provides inline editing capabilities for table cells with support
 * for multiple input types including text, number, date, select, and more. It handles
 * debouncing, option fetching, and state synchronization automatically.
 *
 * @module DataTableFormInput
 *
 * Key Features:
 * - Type-safe with TypeScript generics
 * - Automatic option fetching for select-based inputs
 * - Debounced text input updates
 * - State synchronization with external changes
 * - Conditional query enabling to prevent unnecessary loading
 * - Error handling with user-friendly messages
 *
 * @example Basic Usage
 * ```tsx
 * <DataTableFormInput
 *   table={table}
 *   column={column}
 *   value={currentValue}
 *   rowData={row.original}
 *   onChange={(newValue) => updateRow(newValue)}
 *   debounce={500}
 * />
 * ```
 *
 * @see {@link DataTableFormInputProps} for component props
 */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Column, Table } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MultipleSelector, { Option } from "@/components/ui/multi-select";

// Utils
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

/**
 * Supported input variant types
 */
export type FormInputVariant =
  | "text"
  | "number"
  | "switch"
  | "select"
  | "multiSelect"
  | "date"
  | "dateRange";

/**
 * Field type metadata for value transformation
 */
export type FormFieldType = "string" | "number" | "boolean" | "date" | "array";

/**
 * Column metadata for form inputs
 */
interface ColumnMeta {
  cellInputVariant?: FormInputVariant;
  fieldType?: FormFieldType;
  filterOptions?: Option[];
  filterOptionsFn?: () => Promise<Option[]>;
}

/**
 * Props for DataTableFormInput component
 */
interface DataTableFormInputProps<TData> {
  /** Table instance */
  table: Table<TData>;
  /** Current cell value */
  value: any;
  /** Complete row data */
  rowData: TData;
  /** Debounce delay in milliseconds for text inputs (default: 1000) */
  debounce?: number;
  /** Column definition */
  column: Column<TData, unknown>;
  /** Callback when value changes */
  onChange: (value: Record<string, any>) => void;
}

/**
 * Variants that require option fetching
 */
const needsOptionsVariants: FormInputVariant[] = ["select", "multiSelect"];

/**
 * Check if variant needs options
 */
const isOptionsBasedVariant = (variant?: string): boolean => {
  return needsOptionsVariants.includes(variant as FormInputVariant);
};

/**
 * Generate SelectItem elements from options
 */
function generateFilterOptions(
  filterOptions?: Option[],
): React.ReactElement[] | null {
  if (!filterOptions || filterOptions.length === 0) return null;

  return filterOptions.map(({ value, label, icon }) => (
    <SelectItem key={value} value={value}>
      <div className="flex cursor-pointer items-center gap-2">
        {icon}
        <p>{label}</p>
      </div>
    </SelectItem>
  ));
}

/**
 * Hook to create a debounced onChange handler
 */
const useDebouncedOnChange = (
  onChange: (value: Record<string, any>) => void,
  delay: number,
) => {
  return useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null;
      return (value: Record<string, any>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onChange(value);
        }, delay);
      };
    })(),
    [onChange, delay],
  );
};

/**
 * Hook to fetch options for select-based inputs
 */
const useFormInputOptions = (
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

  // Memoize query function to prevent unnecessary re-renders
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
    queryKey: ["formInputOptions", columnId],
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
 * DataTableFormInput - Renders appropriate input for inline table cell editing
 *
 * @template TData - The type of the table data
 */
export default function DataTableFormInput<TData>({
  value: originalValue,
  table,
  rowData,
  column,
  debounce = 1000,
  onChange,
}: DataTableFormInputProps<TData>) {
  const [cellValue, setCellValue] = useState(originalValue);
  const meta = column.columnDef.meta as ColumnMeta | undefined;
  const filterVariant = meta?.cellInputVariant;

  // Sync with external value changes
  useEffect(() => {
    setCellValue(originalValue);
  }, [originalValue]);

  // Fetch options if needed
  const { isLoading, isError, options, error } = useFormInputOptions(
    column.id,
    meta,
  );

  // Debounced onChange handler for text inputs
  const debouncedOnChange = useDebouncedOnChange(onChange, debounce);

  // Loading state - only for variants that need options
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Icons.spinner className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state - only for variants that need options
  if (isError) {
    return (
      <Alert variant="destructive" className="p-2">
        <AlertDescription className="text-xs">
          {error?.message || "Failed to load options"}
        </AlertDescription>
      </Alert>
    );
  }

  // Render appropriate input based on variant
  switch (filterVariant) {
    case "number": {
      const numValue = cellValue as number | undefined;
      return (
        <div className="flex space-x-2">
          <Input
            type="text"
            inputMode="numeric"
            value={numValue ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              // Validate numeric input
              if (value && isNaN(Number(value))) return;
              setCellValue(value);
              debouncedOnChange({
                [column.id]: value ? Number(value) : undefined,
              });
            }}
            placeholder={`Enter ${column.id}`}
            className="w-16 flex-1 rounded border shadow"
            aria-label={`Enter ${column.id}`}
          />
        </div>
      );
    }
    case "switch": {
      const boolValue = cellValue as boolean;
      return (
        <div className="flex justify-center">
          <Switch
            checked={boolValue}
            onCheckedChange={(value) => {
              setCellValue(value);
              onChange({ [column.id]: value });
            }}
            aria-label={`Toggle ${column.id}`}
          />
        </div>
      );
    }

    case "select": {
      const selectValue = cellValue?.toString() || "";
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Select
            onValueChange={(value) => {
              setCellValue(value);
              onChange({ [column.id]: value });
            }}
            value={selectValue}
          >
            <SelectTrigger aria-label={`Select ${column.id}`}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>{generateFilterOptions(options)}</SelectContent>
          </Select>
          {!!cellValue && (
            <Button
              variant="ghost"
              size="icon"
              className="size-5"
              onClick={() => {
                setCellValue(undefined);
                onChange({ [column.id]: undefined });
              }}
              aria-label="Clear selection"
            >
              <Icons.close className="size-4" />
            </Button>
          )}
        </div>
      );
    }
    case "multiSelect": {
      const optionValue = (cellValue as Option[]) ?? [];
      return (
        <div className="flex flex-row items-center justify-between gap-1">
          <MultipleSelector
            className="w-full"
            onChange={(selectedOptions) => {
              setCellValue(selectedOptions);
              onChange({ [column.id]: selectedOptions });
            }}
            placeholder="Select multiple..."
            value={optionValue}
            options={options}
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
            aria-label={`Select multiple ${column.id}`}
          />
        </div>
      );
    }
    case "date": {
      const dateValue = cellValue as Date | undefined;
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
                aria-label={`Select date for ${column.id}`}
              >
                <Icons.calendar className="mr-2 size-4" />
                {dateValue ? format(dateValue, "PP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Calendar
                mode="single"
                className="rounded-xs border shadow-sm w-56"
                captionLayout="dropdown"
                selected={dateValue}
                onSelect={(date?: Date) => {
                  setCellValue(date);
                  onChange({ [column.id]: date });
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }
    case "dateRange": {
      const dateRangeValue = cellValue as
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
                aria-label={`Select date range for ${column.id}`}
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
                  <span>Pick a date range</span>
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
                  setCellValue(newRange);
                  onChange({ [column.id]: newRange });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }
    // Text input (default)
    case "text":
    default: {
      const value = (cellValue ?? "") as string;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Input
            className="w-full rounded border shadow"
            onChange={(e) => {
              const inputValue = e.target.value;
              setCellValue(inputValue);

              // Transform value based on field type
              const fieldTypeValue =
                meta?.fieldType === "array"
                  ? inputValue
                      ?.split(",")
                      .map((v) => v.trim())
                      .filter(Boolean)
                  : inputValue;

              debouncedOnChange({ [column.id]: fieldTypeValue });
            }}
            placeholder={`Enter ${column.id}`}
            value={value}
            aria-label={`Enter ${column.id}`}
          />
        </div>
      );
    }
  }
}
