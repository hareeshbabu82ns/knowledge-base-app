"use client";

import { DataTableBasic } from "@/components/data-table/datatable-basic";
import { filterFnMultiSelect } from "@/components/data-table/utils";
import { ExpenseAccount } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";
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

export default function AccountsTable(props: {
  tableData: ExpenseAccount[];
  refetch: () => void;
}) {
  const { tableData, refetch } = props;
  return (
    <DataTableBasic
      title="Accounts"
      data={tableData}
      columns={columns}
      refetch={refetch}
    />
  );
}
