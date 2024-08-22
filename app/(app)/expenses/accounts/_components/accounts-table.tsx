"use client";

import { Card } from "@/components/ui/card";
import { DataTableColumnHeader } from "@/components/data-table/datatable-column-header";
import { DataTablePagination } from "@/components/data-table/datatable-pagination";
import { DataTableViewOptions } from "@/components/data-table/datatable-view-options";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { DataTableHeader } from "@/components/data-table/datatable-header";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

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
      header: "Account Name",
      cell: (info: any) => (
        <Link href={`/expenses/accounts/${info.row.original.id}`}>
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("type", {
      id: "type",
      header: "Type",
      cell: (info: any) => (
        <div className="flex w-full items-center gap-[14px]">
          <p className="text-sm font-medium text-zinc-950 dark:text-white">
            {info.getValue()}
          </p>
        </div>
      ),
    }),
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
    <Card className={"w-full"}>
      <DataTableHeader
        table={table}
        title="Accounts"
        showGoToPage
        actions={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.resetColumnFilters()}
            >
              <Icons.reset className="size-4" />
            </Button>
          </>
        }
      />
      <Table className="w-full">
        {table.getHeaderGroups().map((headerGroup: any) => (
          <TableHeader key={headerGroup.id} className="border-b p-6">
            <tr className="">
              {headerGroup.headers.map((header: any) => (
                <DataTableColumnHeader key={header.id} header={header} />
              ))}
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
      <DataTablePagination table={table} />
    </Card>
  );
}

export default AccountsTable;
const columnHelper = createColumnHelper<RowObj>();
