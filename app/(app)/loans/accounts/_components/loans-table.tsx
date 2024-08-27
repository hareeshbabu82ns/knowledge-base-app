"use client";

import { DataTableBasic } from "@/components/data-table/datatable-basic";
import { filterFnDateRange } from "@/components/data-table/utils";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Loan } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import React from "react";

const columnHelper = createColumnHelper<Loan>();
const columns = [
  columnHelper.accessor("id", {
    id: "id",
    header: "id",
    meta: {
      filterVariant: "text",
    },
  }),
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (info: any) => (
      <Link href={`/loans/accounts/${info.row.original.id}`}>
        {info.getValue()}
      </Link>
    ),
    meta: {
      filterVariant: "text",
    },
  }),
  columnHelper.accessor("amount", {
    id: "amount",
    header: "Amount",
    meta: {
      filterVariant: "range",
    },
  }),
  columnHelper.accessor("startDate", {
    id: "startDate",
    header: "Date",
    cell: (info: any) => (
      <p className="text-sm font-medium">
        {info.getValue().toLocaleDateString()}
      </p>
    ),
    filterFn: filterFnDateRange,
    meta: {
      filterVariant: "dateRange",
    },
  }),
];

export default function LoansTable(props: {
  data: Loan[];
  refetch: () => void;
}) {
  const { data, refetch } = props;
  return (
    <DataTableBasic
      title="Loans"
      data={data}
      columns={columns}
      refetch={refetch}
      actions={
        <>
          <Button size="icon" variant="ghost" asChild>
            <Link href={`/loans/accounts/new`}>
              <Icons.add className="size-5" />
            </Link>
          </Button>
        </>
      }
    />
  );
}
