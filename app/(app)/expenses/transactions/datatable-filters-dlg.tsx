"use client";

import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";

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

export const DEFAULT_PAGE_INDEX = 0;
export const DEFAULT_PAGE_SIZE = 20;

export interface DataTableFiltersAtomProps {
  filter: ColumnFiltersState;
  pagination: PaginationState;
  sorting: SortingState;
  visibility: VisibilityState;
}

interface DataTableFiltersProps<TData> {
  table: Table<TData>;
  className?: string;
  resetFilters?: () => void;
}

export function DataTableFilters<TData>({
  table,
  className,
  resetFilters,
}: DataTableFiltersProps<TData>) {
  return (
    <div
      className={cn(
        "@container/tfilters flex flex-1 flex-col gap-2 p-4",
        className,
      )}
    >
      <div className="@md/tfilters:flex-row flex flex-1 flex-col items-end justify-between gap-2">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="columnVisibility">Column Visibility</Label>
          <DropdownMenu>
            <DropdownMenuTrigger id="columnVisibility" asChild>
              <Button
                variant="outline"
                className="flex w-[150px] justify-between"
              >
                Columns <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="rowsPerPage">Row per Page</Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger id="rowsPerPage" className="w-[100px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="gotoPage">Goto Page</Label>
          <DebouncedInput
            id="gotoPage"
            type="text"
            inputMode="numeric"
            className="w-[100px]"
            placeholder="Go to page"
            value={table.getState().pagination.pageIndex + 1}
            onChange={(value) => {
              const page = value ? Number(value) - 1 : 0;
              table.setPageIndex(page);
            }}
          />
        </div>

        {resetFilters && (
          <Button
            variant="outline"
            size="icon"
            className="px-2"
            onClick={resetFilters}
          >
            <Icons.reset className="size-5" />
          </Button>
        )}
      </div>

      {/* Column Filters */}
      <div className="@4xl/tfilters:grid-cols-3 @sm/tfilters:grid-cols-2 mt-4 grid grid-cols-1 items-end justify-between gap-6">
        {table.getLeafHeaders().map((header) => {
          if (!header.column.getCanFilter()) return null;
          return (
            <div
              key={header.id}
              className="flex w-full max-w-sm flex-col gap-2"
            >
              <Label htmlFor={header.id}>{header.column.id}</Label>
              <DataTableColumnFilter column={header.column} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
