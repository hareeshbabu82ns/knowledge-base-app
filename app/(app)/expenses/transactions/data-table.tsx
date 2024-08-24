"use client";
import {
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useCallback, useMemo, useState } from "react";
import { DataTablePagination } from "@/components/data-table/datatable-pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "./actions";
import { subMonths } from "date-fns";
import { DataTableHeader } from "@/components/data-table/datatable-header";
import { DataTableColumnHeader } from "@/components/data-table/datatable-column-header";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/components/data-table/datatable-filters";
import { columns } from "./columns";
import Loader from "@/components/shared/loader";

const defaultSorting: SortingState = [{ id: "date", desc: true }];
const defaultColumnVisibility: VisibilityState = {
  id: false,
  type: false,
};
const defaultPagination: PaginationState = {
  pageIndex: DEFAULT_PAGE_INDEX,
  pageSize: DEFAULT_PAGE_SIZE,
};
const defaultColumnFilters: ColumnFiltersState = [
  { id: "date", value: [subMonths(new Date(), 6), undefined] },
];

export function DataTable() {
  const [sorting, setSorting] = React.useState(defaultSorting);
  const [pagination, setPagination] = React.useState(defaultPagination);
  const [columnFilters, setColumnFilters] =
    React.useState(defaultColumnFilters);
  const [columnVisibility, setColumnVisibility] = useState(
    defaultColumnVisibility,
  );

  const dataQuery = useQuery({
    queryKey: ["transactions", pagination, sorting, columnFilters],
    queryFn: () =>
      fetchTransactions({ pagination, sorting, filters: columnFilters }),
    placeholderData: keepPreviousData,
  });
  const { isFetching, isLoading, refetch } = dataQuery;

  const defaultData = useMemo(() => [], []);

  const resetFilters = useCallback(() => {
    setSorting(defaultSorting);
    setPagination(defaultPagination);
    setColumnFilters(defaultColumnFilters);
    setColumnVisibility(defaultColumnVisibility);
  }, []);

  const table = useReactTable({
    data: dataQuery.data?.rows ?? defaultData,
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
    manualFiltering: true,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <DataTableHeader
          table={table}
          title="Transactions"
          resetFilters={resetFilters}
          isFiltersOpen={true}
          refetch={() => refetch()}
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
                  {isFetching || isLoading ? <Loader /> : "No results"}
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
