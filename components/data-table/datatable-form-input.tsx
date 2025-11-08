"use client";

import { CellContext, Column, Table } from "@tanstack/react-table";
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
import { use, useEffect, useState } from "react";
import { Switch } from "../ui/switch";

function generateFilterOptions(filterOptions?: Option[]) {
  if (!filterOptions) return null;

  return filterOptions.map(({ value, label }) => (
    <SelectItem key={value} value={value}>
      <div className="flex cursor-pointer items-center gap-2">
        <p>{label}</p>
      </div>
    </SelectItem>
  ));
}

interface DataTableFormInputProps<TData> {
  table: Table<TData>;
  value: any;
  rowData: TData;
  debounce?: number;
  column: Column<TData, unknown>;
  onChange: (value: any) => void;
}

export default function DataTableFormInput<TData>({
  value: originalValue,
  table,
  rowData,
  column,
  debounce = 1000,
  onChange,
}: DataTableFormInputProps<TData>) {
  const [cellValue, setCellValue] = useState(originalValue);
  useEffect(() => {
    setCellValue(originalValue);
  }, [originalValue]);

  const {
    cellInputVariant: filterVariant,
    filterOptions,
    filterOptionsFn,
  } = column.columnDef.meta ?? {};

  const {
    isLoading,
    isPending,
    isError,
    data: options,
    error,
  } = useQuery({
    queryKey: ["filters", column.id],
    queryFn: async () => {
      if (filterOptionsFn) {
        return await filterOptionsFn();
      } else if (filterOptions) {
        return filterOptions;
      } else {
        return [];
      }
    },
  });
  if (isLoading || isPending) return <div>Loading...</div>;

  switch (filterVariant) {
    case "number":
      const numValue = cellValue as number;
      return (
        <div className="flex space-x-2">
          <Input
            type="text"
            inputMode="numeric"
            value={numValue}
            onChange={(e) => {
              if (isNaN(Number(e.target.value))) return;
              setCellValue(e.target.value);
              onChange({ [column.id]: e.target.value });
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
            checked={boolValue}
            onCheckedChange={(value) => {
              setCellValue(value);
              onChange({ [column.id]: value });
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
              onChange({ [column.id]: value });
            }}
            value={cellValue?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="select filter" />
            </SelectTrigger>
            <SelectContent>{generateFilterOptions(options)}</SelectContent>
          </Select>
          {!!cellValue && (
            <Button
              variant="ghost"
              size="icon"
              className="size-5"
              onClick={(e) => {
                setCellValue(undefined);
                onChange({ [column.id]: undefined });
              }}
            >
              <Icons.close className="size-4" />
            </Button>
          )}
        </div>
      );
    case "multiSelect":
      const optionValue = cellValue as Option[];
      return (
        <div className="flex flex-row items-center justify-between gap-1">
          <MultipleSelector
            className="w-full"
            onChange={(e) => {
              setCellValue(e);
              onChange({ [column.id]: e });
            }}
            placeholder="multi select..."
            value={optionValue}
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
        </div>
      );
    case "date":
      const dateValue = cellValue as Date;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !cellValue && "text-muted-foreground",
                )}
              >
                <Icons.calendar className="mr-2 size-4" />
                {cellValue ? format(dateValue, "PP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
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
    case "dateRange":
      const dateRangeValue = cellValue as [Date, Date];
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !cellValue && "text-muted-foreground",
                )}
              >
                {dateRangeValue?.[0] ? (
                  dateRangeValue?.[1] ? (
                    <>
                      {format(dateRangeValue?.[0], "LLL dd, y")} -{" "}
                      {format(dateRangeValue?.[1], "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRangeValue?.[0], "LLL dd, y")
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
                  setCellValue([dateRange?.from, dateRange?.to]);
                  onChange({ [column.id]: [dateRange?.from, dateRange?.to] });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    default:
      const value = (cellValue ?? "") as string;
      // const oldValue = originalValue as string;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Input
            className="w-full rounded border shadow"
            onChange={(e) => {
              setCellValue(e.target.value);
              const fieldTypeValue =
                column.columnDef.meta?.fieldType === "array"
                  ? e.target.value?.split(",")
                  : e.target.value;
              onChange({ [column.id]: fieldTypeValue });
            }}
            placeholder={`Enter ${column.id}`}
            value={value}
          />
        </div>
      );
  }
}
