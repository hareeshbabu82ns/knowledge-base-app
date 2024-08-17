"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTableColumnHeader } from "@/components/ui/datatable-column-header";
import { DataTablePagination } from "@/components/ui/datatable-pagination";
import { DataTableViewOptions } from "@/components/ui/datatable-view-options";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  PaginationState,
  createColumnHelper,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import Link from "next/link";
import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

type RowObj = {
  id?: string;
  userId?: string;
  name: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

function AccountsTable(props: { tableData: RowObj[] }) {
  const { tableData } = props;
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  let defaultData = tableData;
  const [globalFilter, setGlobalFilter] = React.useState("");
  const createPages = (count: number) => {
    let arrPageCount = [];

    for (let i = 1; i <= count; i++) {
      arrPageCount.push(i);
    }

    return arrPageCount;
  };
  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Name" />
      ),
      cell: (info: any) => (
        <Link href={`/expenses/accounts/${info.row.original.id}`}>
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("type", {
      id: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: (info: any) => (
        <div className="flex w-full items-center gap-[14px]">
          <p className="text-sm font-medium text-zinc-950 dark:text-white">
            {info.getValue()}
          </p>
        </div>
      ),
    }),
    // columnHelper.accessor("updatedAt", {
    //   id: "updatedAt",
    //   header: () => (
    //     <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
    //       Updated At
    //     </p>
    //   ),
    //   cell: (info: any) => (
    //     <p className="text-sm font-medium text-zinc-950 dark:text-white">
    //       {info.getValue().toLocaleDateString()}
    //     </p>
    //   ),
    // }),
  ]; // eslint-disable-next-line
  const [data, setData] = React.useState(() => [...defaultData]);
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <Card className={"size-full p-0"}>
      <div className="flex items-center border-b p-2">
        <h5 className="ml-2">Accounts</h5>
        <DataTableViewOptions table={table} />
      </div>
      <Table className="w-full">
        {table.getHeaderGroups().map((headerGroup: any) => (
          <TableHeader key={headerGroup.id} className="border-b p-6">
            <tr className="">
              {headerGroup.headers.map((header: any) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer pl-5 pr-4 pt-2 text-start"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {{
                      asc: "",
                      desc: "",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                );
              })}
            </tr>
          </TableHeader>
        ))}
        <TableBody>
          {table.getRowModel().rows.map((row: any) => {
            return (
              <TableRow key={row.id} className="px-6">
                {row.getVisibleCells().map((cell: any) => {
                  return (
                    <TableCell
                      key={cell.id}
                      className="w-max border-b py-5 pl-5 pr-4 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="py-2">
        <DataTablePagination table={table} />
      </div>
    </Card>
  );
}

export default AccountsTable;
const columnHelper = createColumnHelper<RowObj>();
