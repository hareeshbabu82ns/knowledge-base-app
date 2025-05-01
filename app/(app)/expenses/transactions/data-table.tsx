"use client";

import { DataTableQuery } from "@/components/data-table/datatable-query";
import { columns, ExpenseTransactionWithAccount } from "./columns";
import {
  fetchTransactions,
  createExpenseTransaction,
  updateExpenseTransaction,
  deleteExpenseTransaction,
  reprocessDBTransactions,
} from "./actions";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { subMonths } from "date-fns";
import { DataQueryCharts } from "./data-query-charts";
import DataTableRowEditForm from "@/components/data-table/datatable-row-edit-form";
import { ExpenseTransactionSchema } from "@/lib/validations/expense-account";
import { Prisma } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const defaultSorting: SortingState = [ { id: "date", desc: true } ];
const defaultColumnVisibility: VisibilityState = {
  id: false,
  type: false,
};
const defaultColumnFilters: ColumnFiltersState = [
  { id: "date", value: [ subMonths( new Date(), 6 ), new Date() ] },
];

const defaultData: Partial<ExpenseTransactionWithAccount> = {
  date: new Date(),
  description: "",
  amount: 0,
  account: "",
  type: "Expense",
  tags: [],
};

async function addFn( data: Partial<ExpenseTransactionWithAccount> ) {
  const dbData: Prisma.ExpenseTransactionCreateInput = {
    date: data.date,
    description: data.description,
    amount: data.amount,
    user: { connect: { id: "" } },
    accountObj: { connect: { id: data.account || "" } },
    type: data.type,
    tags: data.tags || [],
  };
  await createExpenseTransaction( dbData );
}

async function updateFn( {
  rowId,
  rowData,
}: {
  rowId: string;
  rowData: Partial<ExpenseTransactionWithAccount>;
} ) {
  // console.log({ rowId, rowData });
  const dbData: Prisma.ExpenseTransactionUpdateInput = {
    date: rowData.date,
    description: rowData.description,
    amount: rowData.amount,
    accountObj: { connect: { id: rowData.account || "" } },
    type: rowData.type,
    tags: rowData.tags || [],
  };
  await updateExpenseTransaction( rowId, dbData );
}

async function deleteFn( { rowId }: { rowId: string } ) {
  // console.log({ rowId, rowData });
  await deleteExpenseTransaction( rowId );
}

export function DataTable() {
  const [ filters, setFilters ] =
    useState<ColumnFiltersState>( defaultColumnFilters );

  const { mutate: reprocessFn, isPending: isReProcessPending } = useMutation( {
    mutationFn: reprocessDBTransactions,
    mutationKey: [ "transactions", filters ],
  } );

  return (
    <div className="flex flex-col gap-4">
      <DataTableQuery
        title="Transactions"
        columns={columns}
        queryKey="transactions"
        queryFn={fetchTransactions}
        addFn={addFn}
        updateFn={updateFn}
        deleteFn={deleteFn}
        defaultSorting={defaultSorting}
        defaultColumnVisibility={defaultColumnVisibility}
        defaultColumnFilters={defaultColumnFilters}
        onColumnFiltersChange={setFilters}
        isFiltersOpen={true}
        beforeTable={( { table }: any ) => (
          <DataQueryCharts columnFilters={table?.getState().columnFilters} />
        )}
        rowEditFormaAsDialog
        rowEditForm={( props ) => (
          <DataTableRowEditForm
            {...props}
            defaultData={defaultData}
            zodSchema={ExpenseTransactionSchema}
          />
        )}
        actions={
          <>
            <Button
              variant="ghost"
              size="icon"
              title="Re-Apply Tags"
              disabled={isReProcessPending}
              onClick={() => {
                reprocessFn(
                  { filters },
                  {
                    onSuccess: ( data ) => {
                      toast.success(
                        `${data.rowCount} Transactions Re-Processed \n ${data.rowCountIgnored} Transactions Ignored`,
                      );
                    },
                    onError: ( error ) => {
                      console.error( error );
                      toast.error( "Error Re-Processing Transactions" );
                    },
                  },
                );
              }}
            >
              <Icons.calculate className="size-4" />
            </Button>
          </>
        }
      />
    </div>
  );
}
