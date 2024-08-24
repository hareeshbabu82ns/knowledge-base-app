"use client";

import { DataTableColumnHeader } from "@/components/data-table/datatable-column-header";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/components/data-table/datatable-filters";
import { DataTableHeader } from "@/components/data-table/datatable-header";
import { DataTablePagination } from "@/components/data-table/datatable-pagination";
import { filterFnMultiSelect } from "@/components/data-table/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseAccount } from "@prisma/client";
import {
  ColumnFiltersState,
  createColumnHelper,
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
import Link from "next/link";
import React from "react";

const columnHelper = createColumnHelper<ExpenseAccount>();
const columns = [
  columnHelper.accessor("name", {
    id: "name",
    header: "Account Name",
    cell: (info: any) => (
      <Link href={`/expenses/accounts/${info.row.original.id}`}>
        {info.getValue()}
      </Link>
    ),
    meta: {
      filterVariant: "text",
    },
  }),
  columnHelper.accessor("type", {
    id: "type",
    header: "Type",
    meta: {
      filterVariant: "multiSelect",
      filterOptions: [
        "Saving Account",
        "Checking Account",
        "Credit Card",
        "Home Loan",
      ].map((t) => ({ label: t, value: t })),
    },
    filterFn: filterFnMultiSelect,
  }),
  // columnHelper.accessor("type", {
  //   id: "type",
  //   header: "Type",
  //   meta: {
  //     filterVariant: "select",
  //     filterOptions: [
  //       "Saving Account",
  //       "Checking Account",
  //       "Credit Card",
  //       "Home Loan",
  //     ].map((t) => ({ label: t, value: t })),
  //   },
  // }),
  // columnHelper.accessor("createdAt", {
  //   id: "createdAt",
  //   header: "Date Created",
  //   cell: (info: any) => (
  //     <p className="text-sm font-medium">
  //       {info.getValue().toLocaleDateString()}
  //     </p>
  //   ),
  //   filterFn: filterFnDateRange,
  //   meta: {
  //     filterVariant: "dateRange",
  //   },
  // }),
];

const defaultSorting: SortingState = [{ id: "name", desc: false }];
const defaultColumnVisibility: VisibilityState = {
  id: false,
};
const defaultPagination: PaginationState = {
  pageIndex: DEFAULT_PAGE_INDEX,
  pageSize: DEFAULT_PAGE_SIZE,
};
const defaultColumnFilters: ColumnFiltersState = [];

function AccountsTable(props: {
  tableData: ExpenseAccount[];
  refetch: () => void;
}) {
  const { tableData } = props;

  const [data, _setData] = React.useState(() => [...tableData]);

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
    filterFns: {},
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
  }, []);

  return (
    <div className="rounded-md border">
      <DataTableHeader
        table={table}
        title="Accounts"
        resetFilters={resetFilters}
        isFiltersOpen={true}
        // refetch={() => refetch()}
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

export default AccountsTable;
