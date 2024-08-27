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
    case "range":
      const rangeValue = columnFilterValue as [number, number];
      return (
        <div className="flex space-x-2">
          <DebouncedInput
            debounce={debounce}
            type="text"
            inputMode="numeric"
            value={rangeValue?.[0] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                value,
                old?.[1],
              ])
            }
            placeholder={`Min`}
            className="w-16 flex-1 rounded border shadow"
          />
          <DebouncedInput
            debounce={debounce}
            type="text"
            inputMode="numeric"
            value={rangeValue?.[1] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                value,
              ])
            }
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
      const optionValue = columnFilterValue as Option[];
      return (
        <div className="flex flex-row items-center justify-between gap-1">
          <MultipleSelector
            className="w-full"
            onChange={(e) => {
              column.setFilterValue(e);
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
      const dateValue = columnFilterValue as Date;
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !columnFilterValue && "text-muted-foreground",
                )}
              >
                <Icons.calendar className="mr-2 size-4" />
                {columnFilterValue ? (
                  format(dateValue, "PP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                captionLayout="dropdown-buttons"
                selected={dateValue}
                onSelect={(date?: Date) => {
                  column.setFilterValue(date);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    case "dateRange":
      const dateRangeValue = columnFilterValue as [Date, Date];
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !columnFilterValue && "text-muted-foreground",
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
                defaultMonth={dateRangeValue?.[0]}
                selected={{
                  from: dateRangeValue?.[0],
                  to: dateRangeValue?.[1],
                }}
                onSelect={(dateRange?: DateRange) => {
                  column.setFilterValue([dateRange?.from, dateRange?.to]);
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
