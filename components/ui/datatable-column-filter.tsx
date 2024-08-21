import { Column } from "@tanstack/react-table";
import ReactDatePicker from "react-datepicker";
import DebouncedInput from "../DebouncedInput";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Icons } from "../shared/icons";
import { Button } from "./button";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./calendar";
import { DateRange } from "react-day-picker";
import MultipleSelector, { Option } from "./multi-select";

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
}: {
  column: Column<any, unknown>;
}) {
  const [columnFilterValue, setColumnFilterValue] = useState(
    column.getFilterValue(),
  );

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

  return filterVariant === "range" ? (
    <div className="flex space-x-2">
      <DebouncedInput
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(value) =>
          column.setFilterValue((old: [number, number]) => [value, old?.[1]])
        }
        placeholder={`Min`}
        className="flex-1 border shadow rounded w-20"
      />
      <DebouncedInput
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(value) =>
          column.setFilterValue((old: [number, number]) => [old?.[0], value])
        }
        placeholder={`Max`}
        className="flex-1 border shadow rounded w-20"
      />
    </div>
  ) : filterVariant === "select" ? (
    <div className="flex w-full flex-row justify-between items-center gap-1">
      <Select
        onValueChange={(e) => {
          column.setFilterValue(e);
          setColumnFilterValue(e);
        }}
        value={columnFilterValue?.toString()}
        defaultValue={column.getFilterValue()?.toString()}
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
            setColumnFilterValue(undefined);
          }}
        >
          <Icons.close className="size-4" />
        </Button>
      )}
    </div>
  ) : filterVariant === "multiSelect" ? (
    <div className="flex max-w-[200px] flex-row justify-between items-center gap-1">
      <MultipleSelector
        onChange={(e) => {
          column.setFilterValue(e);
          setColumnFilterValue(e);
        }}
        value={columnFilterValue as Option[]}
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
  ) : filterVariant === "date" ? (
    <div className="flex w-full flex-row justify-between items-center gap-1">
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
              format(columnFilterValue as Date, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={columnFilterValue as Date}
            onSelect={(date?: Date) => {
              column.setFilterValue(date);
              setColumnFilterValue(date);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  ) : filterVariant === "dateRange" ? (
    <div className="flex w-full flex-row justify-between items-center gap-1">
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
            {(columnFilterValue as [Date, Date])?.[0] ? (
              (columnFilterValue as [Date, Date])?.[1] ? (
                <>
                  {format(
                    (columnFilterValue as [Date, Date])?.[0],
                    "LLL dd, y",
                  )}{" "}
                  -{" "}
                  {format(
                    (columnFilterValue as [Date, Date])?.[1],
                    "LLL dd, y",
                  )}
                </>
              ) : (
                format((columnFilterValue as [Date, Date])?.[0], "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={(columnFilterValue as [Date, Date])?.[0]}
            selected={{
              from: (columnFilterValue as [Date, Date])?.[0],
              to: (columnFilterValue as [Date, Date])?.[1],
            }}
            onSelect={(dateRange?: DateRange) => {
              column.setFilterValue([dateRange?.from, dateRange?.to]);
              setColumnFilterValue([dateRange?.from, dateRange?.to]);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  ) : (
    <div className="flex w-full flex-row justify-between items-center gap-1">
      <DebouncedInput
        className="w-full border shadow rounded"
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search...`}
        type="text"
        value={(columnFilterValue ?? "") as string}
      />
    </div>
  );
}
