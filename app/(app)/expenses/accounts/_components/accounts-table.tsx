"use client";

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/components/data-table/datatable-filters";
import { DataTableGeneric } from "@/components/data-table/datatable-generic";
import {
  ColumnFiltersState,
  createColumnHelper,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import Link from "next/link";
import React from "react";

type RowObj = {
  id?: string;
  userId?: string;
  name: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

function AccountsTable(props: { tableData: RowObj[]; refetch: () => void }) {
  const { tableData, refetch } = props;
  const [data, setData] = React.useState(() => [...tableData]);

  const columns = React.useMemo(() => {
    const columnHelper = createColumnHelper<RowObj>();

    return [
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
          filterVariant: "text",
        },
      }),
    ];
  }, []);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "name", desc: true },
  ]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: 10,
  });

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
    });

  return (
    <DataTableGeneric
      title="Accounts"
      data={data}
      rowCount={data?.length}
      columns={columns as any}
      sorting={sorting}
      // onSortingChange={setSorting}
      pagination={pagination}
      // onPaginationChange={setPagination}
      columnFilters={columnFilters}
      // onColumnFiltersChange={setColumnFilters}
      resetFilters={() => {
        setColumnFilters([]);
        setSorting([{ id: "name", desc: true }]);
        setPagination({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: 10,
        });
        setColumnVisibility({
          id: false,
        });
      }}
    />
  );
}

export default AccountsTable;
