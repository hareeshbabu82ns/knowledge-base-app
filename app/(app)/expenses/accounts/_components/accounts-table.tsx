"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Account Name
        </p>
      ),
      cell: (info: any) => (
        <Link href={`/expenses/accounts/${info.row.original.id}`}>
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("type", {
      id: "type",
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Type
        </p>
      ),
      cell: (info: any) => (
        <div className="flex w-full items-center gap-[14px]">
          <p className="text-sm font-medium text-zinc-950 dark:text-white">
            {info.getValue()}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      header: () => (
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Updated At
        </p>
      ),
      cell: (info: any) => (
        <p className="text-sm font-medium text-zinc-950 dark:text-white">
          {info.getValue().toLocaleDateString()}
        </p>
      ),
    }),
  ]; // eslint-disable-next-line
  const [data, setData] = React.useState(() => [...defaultData]);
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 11,
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
    <Card
      className={
        "size-full border-zinc-200 p-0 sm:overflow-auto dark:border-zinc-800"
      }
    >
      <div className="overflow-x-scroll xl:overflow-x-hidden">
        <Table className="w-full">
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableHeader
              key={headerGroup.id}
              className="border-b border-zinc-200 p-6 dark:border-zinc-800"
            >
              <tr className="dark:border-zinc-800">
                {headerGroup.headers.map((header: any) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800"
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
                })}{" "}
              </tr>
            </TableHeader>
          ))}
          <TableBody>
            {table
              .getRowModel()
              .rows.slice(0, 7)
              .map((row: any) => {
                return (
                  <TableRow
                    key={row.id}
                    className="px-6 dark:hover:bg-gray-900"
                  >
                    {row.getVisibleCells().map((cell: any) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className="w-max border-b border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10"
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
        {/* pagination */}
        <div className="mt-2 flex h-20 w-full items-center justify-between px-6">
          {/* left side */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Showing 6 rows per page
            </p>
          </div>
          {/* right side */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`flex items-center justify-center rounded-lg bg-transparent p-2 text-lg text-zinc-950 transition duration-200 hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent`}
            >
              <MdChevronLeft />
            </Button>

            {/* {createPages(table.getPageCount()).map((pageNumber, index) => {
       return (
        <Button
         className={`font-mediumflex p-0 items-center justify-center rounded-lg p-2 text-sm transition duration-200 ${
          pageNumber === pageIndex + 1
           ? ''
           : 'border border-zinc-200 bg-[transparent] dark:border-zinc-800 dark:text-white'
         }`}
         onClick={() => table.setPageIndex(pageNumber - 1)}
         key={index}
        >
         {pageNumber}
        </Button>
       );
      })} */}
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`flex min-w-[34px] items-center justify-center rounded-lg bg-transparent p-2 text-lg text-zinc-950 transition duration-200 hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent`}
            >
              <MdChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AccountsTable;
const columnHelper = createColumnHelper<RowObj>();
