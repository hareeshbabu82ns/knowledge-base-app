"use client";

import * as dateFn from "date-fns";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import { filterFnMultiSelect } from "@/components/data-table/utils";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { downloadFile } from "@/lib/utils";
import { ExpenseAccount } from "@/app/generated/prisma";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const columnHelper = createColumnHelper<ExpenseAccount>();
const columns = [
  columnHelper.accessor( "name", {
    id: "name",
    header: "Account Name",
    cell: ( info: any ) => (
      <Link href={`/expenses/accounts/${info.row.original.id}`}>
        {info.getValue()}
      </Link>
    ),
    meta: {
      filterVariant: "text",
    },
  } ),
  columnHelper.accessor( "type", {
    id: "type",
    header: "Type",
    meta: {
      filterVariant: "multiSelect",
      filterOptions: [
        "Saving Account",
        "Checking Account",
        "Credit Card",
        "Home Loan",
      ].map( ( t ) => ( { label: t, value: t } ) ),
    },
    filterFn: filterFnMultiSelect,
  } ),
];

export default function AccountsTable( props: {
  tableData: ExpenseAccount[];
  refetch: () => void;
} ) {
  const router = useRouter();
  const { tableData, refetch } = props;

  return (
    <DataTableBasic
      title="Accounts"
      data={tableData}
      columns={columns}
      refetch={refetch}
      actions={
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              router.push( "/expenses/accounts/new" );
            }}
          >
            <Icons.add className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const datePrefix = `${dateFn.format( Date.now(), "y-MM-dd-HH-mm" )}`;
              const fileName = `${datePrefix}-accounts.json`;
              downloadFile( {
                fileName,
                data: JSON.stringify( tableData, null, 2 ),
                fileType: "application/json",
              } );
            }}
          >
            <Icons.download className="size-5" />
          </Button>
        </>
      }
    />
  );
}
