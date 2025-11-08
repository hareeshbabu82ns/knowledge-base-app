"use client";

import { CellContext } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import MultipleSelector, { Option } from "@/components/ui/multi-select";
import { Input } from "../ui/input";
import React, { useState, useCallback, useEffect } from "react";
import { Switch } from "../ui/switch";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";

function generateFilterOptions(
  filterOptions?: Option[],
): React.ReactElement[] | null {
  if (!filterOptions || filterOptions.length === 0) return null;

  return filterOptions.map(({ value, label }) => (
    <SelectItem key={value} value={value}>
      <div className="flex cursor-pointer items-center gap-2">
        <p>{label}</p>
      </div>
    </SelectItem>
  ));
}

interface DataTableCellInputProps<TData> extends CellContext<TData, unknown> {
  debounce?: number;
}

export default function DataTableCellInput<TData>({
  getValue,
  table,
  row,
  column,
  debounce = 1000,
}: DataTableCellInputProps<TData>) {
  const [cellValue, setCellValue] = useState(getValue());

  // Sync with external value changes
  useEffect(() => {
    setCellValue(getValue());
  }, [getValue]);

  const {
    cellInputVariant: filterVariant,
    filterOptions,
    filterOptionsFn,
  } = column.columnDef.meta ?? {};

  // Memoize query function to prevent unnecessary re-renders
  const queryFn = useCallback(async (): Promise<Option[]> => {
    if (filterOptionsFn) {
      const result = await filterOptionsFn();
      return result ?? [];
    } else if (filterOptions) {
      return filterOptions;
    }
    return [];
  }, [filterOptionsFn, filterOptions]);

  // Only fetch options for select and multiSelect variants
  const needsOptions =
    filterVariant === "select" || filterVariant === "multiSelect";

  const {
    isLoading,
    isPending,
    isError,
    data: options = [],
    error,
  } = useQuery<Option[], Error>({
    queryKey: ["filters", column.id],
    queryFn,
    enabled: needsOptions && !!(filterOptionsFn || filterOptions),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Wrapper for update with error handling
  const updateCellData = useCallback(
    async (value: unknown) => {
      try {
        if (table.options.meta?.updateCellData) {
          await table.options.meta.updateCellData({
            rowId: row.id,
            rowData: row.original,
            columnId: column.id,
            value,
          });
        }
      } catch (error) {
        console.error("Cell update error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update cell",
        );
      }
    },
    [table.options.meta, row.id, row.original, column.id],
  );

  // Loading state - only for variants that need options
  if (needsOptions && (isLoading || isPending)) {
    return (
      <div className="flex items-center justify-center p-2">
        <Icons.spinner className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state - only for variants that need options
  if (needsOptions && isError) {
    return (
      <Alert variant="destructive" className="p-2">
        <AlertDescription className="text-xs">
          {error?.message || "Failed to load options"}
        </AlertDescription>
      </Alert>
    );
  }

  switch (filterVariant) {
    case "number":
      const numValue = cellValue as number;
      const originalNumValue = getValue() as number;
      return (
        <div className="flex space-x-2">
          <Input
            type="text"
            inputMode="numeric"
            value={numValue ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value && isNaN(Number(value))) return;
              setCellValue(value);
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (value && isNaN(Number(value))) return;
              const numVal = value ? Number(value) : undefined;
              if (numVal !== originalNumValue) {
                updateCellData(numVal);
              }
            }}
            placeholder={`Enter ${column.id}`}
            className="w-16 flex-1 rounded border shadow"
          />
        </div>
      );
    case "switch":
      const boolValue = cellValue as boolean;
      return (
        <div className="flex justify-center">
          <Switch
            checked={boolValue ?? false}
            onCheckedChange={(value) => {
              setCellValue(value);
              updateCellData(value);
            }}
          />
        </div>
      );
    case "select":
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Select
            onValueChange={(value) => {
              setCellValue(value);
              updateCellData(value);
            }}
            value={cellValue?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="select option" />
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
                updateCellData(undefined);
              }}
            >
              <Icons.close className="size-4" />
            </Button>
          )}
        </div>
      );
    case "multiSelect":
      const optionValue = (cellValue as Option[]) ?? [];
      return (
        <div className="flex flex-row items-center justify-between gap-1">
          <MultipleSelector
            className="w-full"
            onChange={(selectedOptions) => {
              setCellValue(selectedOptions);
              updateCellData(selectedOptions);
            }}
            placeholder="multi select..."
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
          />
        </div>
      );
    case "date":
      const dateValue = cellValue as Date | undefined;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground",
                )}
              >
                <Icons.calendar className="mr-2 size-4" />
                {dateValue ? format(dateValue, "PP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Calendar
                mode="single"
                className="rounded-xs border shadow-sm w-56"
                captionLayout="dropdown"
                selected={dateValue}
                defaultMonth={dateValue}
                onSelect={(date?: Date) => {
                  setCellValue(date);
                  updateCellData(date);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    case "dateRange":
      const dateRangeValue = cellValue as
        | [Date | undefined, Date | undefined]
        | undefined;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRangeValue && "text-muted-foreground",
                )}
              >
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
                  <span>Pick a date</span>
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
                  updateCellData(newRange);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    default:
      const value = (cellValue ?? "") as string;
      const oldValue = getValue() as string;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Input
            className="w-full rounded border shadow"
            onChange={(e) => setCellValue(e.target.value)}
            onBlur={(e) => {
              const inputValue = e.target.value;
              if (inputValue !== oldValue) {
                const fieldTypeValue =
                  column.columnDef.meta?.fieldType === "array"
                    ? inputValue
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean)
                    : inputValue;
                updateCellData(fieldTypeValue);
              }
            }}
            placeholder={`Enter ${column.id}`}
            value={value}
          />
        </div>
      );
  }
}
