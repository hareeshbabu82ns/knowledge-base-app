"use client";

import { Table } from "@tanstack/react-table";
import React from "react";
import { cn } from "@/lib/utils";
import DebouncedInput from "@/components/DebouncedInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import DataTableColumnFilter from "@/components/data-table/datatable-column-filter";
import { Badge } from "../ui/badge";

export const DEFAULT_PAGE_INDEX = 0;
export const DEFAULT_PAGE_SIZE = 20;

interface DataTableFiltersProps<TData> {
  table: Table<TData>;
  className?: string;
  resetFilters?: () => void;
  debounce?: number;
}

export function DataTableFilters<TData>({
  table,
  className,
  resetFilters,
  debounce = 1000,
}: DataTableFiltersProps<TData>) {
  // Memoize visible columns to prevent re-renders
  const visibleColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => column.getCanHide() && column.getIsVisible()),
    [table],
  );

  // Memoize hideable columns
  const hideableColumns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanHide()),
    [table],
  );

  // Memoize filterable columns
  const filterableColumns = React.useMemo(
    () =>
      table
        .getAllLeafColumns()
        .filter(
          (column) =>
            column.getCanFilter() && column.columnDef.meta?.filterVariant,
        ),
    [table],
  );

  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div
      className={cn(
        "@container/tfilters flex flex-1 flex-col gap-2 p-4",
        className,
      )}
    >
      {/* <div className="@md/tfilters:flex-row flex flex-1 flex-col items-end justify-between gap-2"> */}
      <div className="@xl/tfilters:grid-cols-4 grid grid-cols-2 items-end gap-2 border-b border-dashed pb-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="columnVisibility">Column Visibility</Label>
          <DropdownMenu>
            <DropdownMenuTrigger id="columnVisibility" asChild>
              <Button variant="outline" className="flex justify-between">
                <div className="no-scrollbar flex w-1 flex-1 gap-2 overflow-x-scroll">
                  {visibleColumns.map((column) => (
                    <Badge key={column.id} className="capitalize">
                      {column.id}
                    </Badge>
                  ))}
                </div>
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="rowsPerPage">Row per Page</Label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              if (!isNaN(newPageSize) && newPageSize > 0) {
                table.setPageSize(newPageSize);
              }
            }}
          >
            <SelectTrigger id="rowsPerPage" className="">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="gotoPage">Goto Page</Label>
          <DebouncedInput
            debounce={debounce}
            id="gotoPage"
            type="text"
            inputMode="numeric"
            className=""
            placeholder="Go to page"
            value={pageIndex + 1}
            onChange={(value) => {
              if (!value) return;
              const pageNum = Number(value);
              if (isNaN(pageNum)) return;

              const page = Math.max(
                0,
                Math.min(pageNum - 1, table.getPageCount() - 1),
              );
              table.setPageIndex(page);
            }}
          />
        </div>

        {resetFilters && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="icon"
              className="px-2"
              onClick={resetFilters}
              title="Reset Filters"
              aria-label="Reset Filters"
            >
              <Icons.reset className="size-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Column Filters */}
      <div className="@4xl/tfilters:grid-cols-3 @sm/tfilters:grid-cols-2 mt-4 grid grid-cols-1 items-end justify-between gap-6">
        {filterableColumns.map((column) => {
          const headerLabel =
            typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id;

          return (
            <div
              key={column.id}
              className="flex w-full max-w-sm flex-col gap-2"
            >
              <Label htmlFor={column.id}>{headerLabel}</Label>
              <DataTableColumnFilter column={column} debounce={debounce} />
            </div>
          );
        })}
        {/* {table.getLeafHeaders().map((header) => {
          if (!header.column.getCanFilter()) return null;
          return (
            <div
              key={header.id}
              className="flex w-full max-w-sm flex-col gap-2"
            >
              <Label htmlFor={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </Label>
              <DataTableColumnFilter column={header.column} />
            </div>
          );
        })} */}
      </div>
    </div>
  );
}
