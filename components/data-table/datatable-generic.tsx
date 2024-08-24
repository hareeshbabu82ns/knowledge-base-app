"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useCallback, useMemo, useState } from "react";
import { DataTablePagination } from "@/components/data-table/datatable-pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { subMonths } from "date-fns";
import { DataTableHeader } from "@/components/data-table/datatable-header";
import { DataTableColumnHeader } from "@/components/data-table/datatable-column-header";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/components/data-table/datatable-filters";

interface DataTableProps<TData, TValue> {
  data: TData[];
  rowCount?: number;
  columns: ColumnDef<TData, TValue>[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  className?: string;
  resetFilters?: () => void;
  title?: React.ReactNode;
}

export function DataTableGeneric<TData, TValue>({
  title,
  columns,
  data = [],
  rowCount = 0,
  sorting = [],
  onSortingChange,
  columnFilters = [],
  onColumnFiltersChange,
  pagination = {
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  onPaginationChange,
  columnVisibility = {
    id: false,
  },
  onColumnVisibilityChange,
  resetFilters: _resetFilters = () => {},
}: DataTableProps<TData, TValue>) {
  // const defaultData = useMemo(() => [], []);

  const resetFilters = useCallback(() => {
    if (_resetFilters) _resetFilters();
    else {
      onColumnFiltersChange && onColumnFiltersChange(columnFilters);
      onSortingChange && onSortingChange(sorting);
      onPaginationChange && onPaginationChange(pagination);
      onColumnVisibilityChange && onColumnVisibilityChange(columnVisibility);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    _resetFilters,
    onColumnFiltersChange,
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
  ]);

  const table = useReactTable({
    data,
    rowCount,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    manualPagination: !!onPaginationChange,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onColumnFiltersChange,
    // manualPagination: !!onPaginationChange,
    // manualSorting: !!onSortingChange,
    // manualFiltering: !!onColumnFiltersChange,
    onSortingChange,
    onPaginationChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: onColumnFiltersChange
      ? undefined
      : getFilteredRowModel(),
    getSortedRowModel: onSortingChange ? undefined : getSortedRowModel(),
    getPaginationRowModel: onPaginationChange
      ? undefined
      : getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <DataTableHeader
          table={table}
          title={title}
          resetFilters={resetFilters}
          isFiltersOpen={true}
        />
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <DataTableColumnHeader key={header.id} header={header} />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
