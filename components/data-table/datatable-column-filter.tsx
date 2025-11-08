"use client";

import { Column } from "@tanstack/react-table";
import DebouncedInput from "@/components/DebouncedInput";
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
import React, { useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function DataTableColumnFilter({
  column,
  debounce = 1000,
}: {
  column: Column<any, unknown>;
  debounce?: number;
}) {
  const columnFilterValue = column.getFilterValue();

  const { filterVariant, filterOptions, filterOptionsFn } =
    column.columnDef.meta ?? {};

  // Only fetch options for select and multiSelect variants
  const needsOptions =
    filterVariant === "select" || filterVariant === "multiSelect";

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
          {error?.message || "Failed to load filter options"}
        </AlertDescription>
      </Alert>
    );
  }

  switch (filterVariant) {
    case "range":
      const rangeValue = (columnFilterValue as [number, number]) ?? [
        undefined,
        undefined,
      ];
      return (
        <div className="flex space-x-2">
          <DebouncedInput
            debounce={debounce}
            type="text"
            inputMode="numeric"
            value={rangeValue?.[0] ?? ""}
            onChange={(value) => {
              const numValue = value ? Number(value) : undefined;
              column.setFilterValue(
                (old: [number | undefined, number | undefined]) => [
                  numValue,
                  old?.[1],
                ],
              );
            }}
            placeholder={`Min`}
            className="w-16 flex-1 rounded border shadow"
          />
          <DebouncedInput
            debounce={debounce}
            type="text"
            inputMode="numeric"
            value={rangeValue?.[1] ?? ""}
            onChange={(value) => {
              const numValue = value ? Number(value) : undefined;
              column.setFilterValue(
                (old: [number | undefined, number | undefined]) => [
                  old?.[0],
                  numValue,
                ],
              );
            }}
            placeholder={`Max`}
            className="w-16 flex-1 rounded border shadow"
          />
        </div>
      );
    case "select":
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Select
            onValueChange={(e) => {
              column.setFilterValue(e);
            }}
            value={columnFilterValue?.toString()}
            // defaultValue={column.getFilterValue()?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="select filter" />
            </SelectTrigger>
            <SelectContent>{generateFilterOptions(options)}</SelectContent>
          </Select>
          {!!columnFilterValue && (
            <Button
              variant="ghost"
              size="icon"
              className="size-5"
              onClick={(e) => {
                column.setFilterValue(undefined);
              }}
            >
              <Icons.close className="size-4" />
            </Button>
          )}
        </div>
      );
    case "multiSelect":
      const optionValue = (columnFilterValue as Option[]) ?? [];
      return (
        <div className="flex flex-row items-center justify-between gap-1">
          <MultipleSelector
            className="w-full"
            onChange={(selectedOptions) => {
              column.setFilterValue(selectedOptions);
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
      const dateValue = columnFilterValue as Date | undefined;
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
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                className="rounded-xs border shadow-sm w-56"
                captionLayout="dropdown"
                selected={dateValue}
                defaultMonth={dateValue}
                onSelect={(date?: Date) => {
                  column.setFilterValue(date);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    case "dateRange":
      const dateRangeValue = columnFilterValue as
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
                  column.setFilterValue(newRange);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    default:
      const value = (columnFilterValue ?? "") as string;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <DebouncedInput
            debounce={debounce}
            className="w-full rounded border shadow"
            onChange={(value) => column.setFilterValue(value)}
            placeholder={`Search...`}
            type="search"
            value={value}
          />
        </div>
      );
  }
}
