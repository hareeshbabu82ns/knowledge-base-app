"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import React from "react";
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "./datatable-filters";
import { DataTableHeader } from "./datatable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTableColumnHeader } from "./datatable-column-header";
import { DataTablePagination } from "./datatable-pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  title?: React.ReactNode;
  defaultSorting?: SortingState;
  defaultPagination?: PaginationState;
  defaultColumnFilters?: ColumnFiltersState;
  defaultColumnVisibility?: VisibilityState;
  className?: string;
  refetch?: () => void;
  isFiltersOpen?: boolean;
  actions?: React.ReactNode;
}

export function DataTableBasic<TData>({
  title,
  data: tableData,
  columns,
  defaultSorting = [{ id: "name", desc: false }],
  defaultPagination = {
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  defaultColumnFilters = [],
  defaultColumnVisibility = { id: false },
  className,
  refetch = () => {},
  isFiltersOpen = false,
  actions,
}: DataTableProps<TData>) {
  const [data, _setData] = React.useState(() => [...tableData]);

  React.useEffect(() => {
    _setData([...tableData]);
  }, [tableData]);

  const [sorting, setSorting] = React.useState(defaultSorting);
  const [pagination, setPagination] = React.useState(defaultPagination);
  const [columnFilters, setColumnFilters] =
    React.useState(defaultColumnFilters);
  const [columnVisibility, setColumnVisibility] = React.useState(
    defaultColumnVisibility,
  );

  const table = useReactTable({
    data,
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
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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

  return (
    <div className={cn("rounded-md border", className)}>
      <DataTableHeader
        table={table}
        title={title}
        resetFilters={resetFilters}
        isFiltersOpen={isFiltersOpen}
        refetch={() => refetch()}
        actions={actions}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
