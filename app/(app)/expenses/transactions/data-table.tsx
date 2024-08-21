"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useMemo, useState } from "react";
import { DataTablePagination } from "@/components/ui/datatable-pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "./actions";
import DataTableColumnFilter from "@/components/ui/datatable-column-filter";
import { subMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
}

export function DataTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "date", value: [subMonths(new Date(), 6), undefined] },
  ]);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const dataQuery = useQuery({
    queryKey: ["transactions", pagination, sorting, columnFilters],
    queryFn: () =>
      fetchTransactions({ pagination, sorting, filters: columnFilters }),
    placeholderData: keepPreviousData,
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    type: false,
  });

  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    data: (dataQuery.data?.rows as TData[]) ?? defaultData,
    rowCount: dataQuery.data?.rowCount,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      // header.column.columnDef.maxSize !==
                      //   Number.MAX_SAFE_INTEGER &&
                      //   `max-w-[${header.column.columnDef.maxSize}px]`,
                      header.column.columnDef.minSize !== 20 &&
                        `min-w-[${header.column.columnDef.minSize}px]`,
                      header.column.columnDef.size !== 150 &&
                        `w-[${header.column.columnDef.size}px]`,
                    )}
                  >
                    <div className="flex flex-col pb-2">
                      <div className="min-h-9 w-full content-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </div>
                      {header.column.getCanFilter() ? (
                        <DataTableColumnFilter column={header.column} />
                      ) : null}
                    </div>
                  </TableHead>
                );
              })}
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
