"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import DebouncedInput from "../DebouncedInput";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  showSelectedText?: boolean;
  showGoToPage?: boolean;
  className?: string;
}

export function DataTablePagination<TData>({
  table,
  showSelectedText = false,
  showGoToPage = false,
  className,
}: DataTablePaginationProps<TData>) {
  return (
    <div
      className={cn(
        "@container/tfooter bg-muted/50 flex flex-1 items-center justify-between p-2 font-medium",
        className,
      )}
    >
      {showSelectedText && (
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
      <div className="@xs/tfooter:flex-row flex flex-1 flex-col items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <p className="@lg/tfooter:block hidden text-sm font-medium">
            Rows per page
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
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
        <div className="flex items-center justify-center gap-1 text-sm font-medium">
          <span className="@lg/tfooter:block hidden">Page :</span>
          <span>{table.getState().pagination.pageIndex + 1}</span>
          <span>of</span>
          <span>{table.getPageCount()}</span>
          <span>({table.getRowCount()})</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="size-4" />
          </Button>
          {showGoToPage && (
            <DebouncedInput
              className="w-14"
              type="text"
              inputMode="numeric"
              placeholder="Go to page"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(value) => {
                const page = value ? Number(value) - 1 : 0;
                table.setPageIndex(page);
              }}
            />
          )}
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
