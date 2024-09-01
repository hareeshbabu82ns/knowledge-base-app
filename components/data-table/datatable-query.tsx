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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { DataTablePagination } from "@/components/data-table/datatable-pagination";
import { DataTableHeader } from "@/components/data-table/datatable-header";
import { DataTableColumnHeader } from "@/components/data-table/datatable-column-header";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/components/data-table/datatable-filters";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Loader from "../shared/loader";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  title?: React.ReactNode;
  columns: ColumnDef<TData, any>[];
  defaultSorting?: SortingState;
  defaultPagination?: PaginationState;
  defaultColumnFilters?: ColumnFiltersState;
  defaultColumnVisibility?: VisibilityState;
  className?: string;
  queryKey: string;
  queryFn: (params: {
    pagination: PaginationState;
    sorting: SortingState;
    filters: ColumnFiltersState;
  }) => Promise<{ rowCount: number; rows: TData[] }>;
  isFiltersOpen?: boolean;
  beforeTable?: React.ReactNode | React.ComponentType;
}

export function DataTableQuery<TData, TValue>({
  title,
  columns,
  defaultSorting = [{ id: "name", desc: false }],
  defaultPagination = {
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  defaultColumnFilters = [],
  defaultColumnVisibility = { id: false },
  className,
  queryKey,
  queryFn,
  isFiltersOpen = false,
  beforeTable,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState(defaultSorting);
  const [pagination, setPagination] = React.useState(defaultPagination);
  const [columnFilters, setColumnFilters] =
    React.useState(defaultColumnFilters);
  const [columnVisibility, setColumnVisibility] = React.useState(
    defaultColumnVisibility,
  );

  const dataQuery = useQuery({
    queryKey: [queryKey, pagination, sorting, columnFilters],
    queryFn: () => queryFn({ pagination, sorting, filters: columnFilters }),
    placeholderData: keepPreviousData,
  });
  const { data, isFetching, isLoading, refetch } = dataQuery;

  const defaultData = React.useMemo(() => [], []);

  const resetFilters = React.useCallback(() => {
    setSorting(defaultSorting);
    setPagination(defaultPagination);
    setColumnFilters(defaultColumnFilters);
    setColumnVisibility(defaultColumnVisibility);
  }, [
    defaultColumnFilters,
    defaultColumnVisibility,
    defaultPagination,
    defaultSorting,
  ]);

  const table = useReactTable({
    data: data?.rows ?? defaultData,
    rowCount: data?.rowCount,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return (
    <div className={cn("rounded-md border", className)}>
      <DataTableHeader
        table={table}
        title={title}
        resetFilters={resetFilters}
        isFiltersOpen={isFiltersOpen}
        refetch={() => refetch()}
      />
      {beforeTable && flexRender(beforeTable, { table })}
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
                    // className="hover:bg-black/5 dark:hover:bg-white/5"
                    className={cn(
                      "p-2 hover:bg-black/5 dark:hover:bg-white/5",
                      cell.column.columnDef.size !== 150
                        ? `w-[${cell.column.columnDef.size}px]`
                        : "",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {isFetching || isLoading ? <Loader /> : "No results"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
