"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import {
  createLoanExtraPayments,
  deleteLoanExtraPayments,
  fetchLoanExtraPayments,
  updateLoanExtraPayments,
} from "../actions";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import Loader from "@/components/shared/loader";
import { createColumnHelper } from "@tanstack/react-table";
import { LoanExtraPayments, Prisma } from "@/app/generated/prisma";
import { filterFnDateRange } from "@/components/data-table/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { format } from "date-fns";
import DataTableRowEditForm from "@/components/data-table/datatable-row-edit-form";
import { LoanExtraPaymentSchema } from "@/lib/validations/loans";
import { toast } from "sonner";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";

const defaultData: LoanExtraPayments = {
  id: "",
  date: new Date(),
  amount: 0,
  continue: false,
  loanId: "",
};

const columnHelper = createColumnHelper<LoanExtraPayments>();
const columns = [
  columnHelper.accessor( "id", {
    id: "id",
    header: "id",
  } ),
  columnHelper.accessor( "date", {
    id: "date",
    header: "Date",
    cell: ( info: any ) => (
      <p className="text-sm font-medium">{format( info.getValue(), "PP" )}</p>
    ),
    filterFn: filterFnDateRange,
    meta: {
      cellInputVariant: "date",
      filterVariant: "dateRange",
    },
  } ),
  columnHelper.accessor( "amount", {
    id: "amount",
    header: "Amount",
    meta: {
      cellInputVariant: "number",
    },
  } ),
  columnHelper.accessor( "continue", {
    id: "continue",
    header: "Continuous",
    size: 50,
    meta: {
      cellInputVariant: "switch",
    },
  } ),
  columnHelper.display( {
    id: "actions",
    header: "Actions",
    size: 50,
    cell: ( { row, table } ) => (
      <div className="flex flex-row gap-1">
        {row.getCanEdit() && (
          <Button
            variant="ghost"
            className="text-destructive size-8 p-2"
            disabled={row.getIsEditing()}
            onClick={() => {
              row.toggleEditing();
            }}
          >
            <Icons.edit className="size-4" />
          </Button>
        )}
        <DeleteConfirmButton
          variant="ghost"
          className="text-destructive size-8 p-2"
          disabled={!table.options.meta?.deleteData}
          toastId={`loan-extra-payments-deletion-${row.id}`}
          toastLabel={`Delete Extra Payment? ${row.original.amount}`}
          onClick={() =>
            table.options.meta?.deleteData!( {
              rowId: row.id,
              rowData: row.original,
            } )
          }
        >
          <Icons.trash className="size-4" />
        </DeleteConfirmButton>
      </div>
    ),
    enableSorting: false,
  } ),
];

interface ExtraPaymentsTableProps {
  className?: string;
  loanId: string;
}

const ExtraPaymentsTable = ( { className, loanId }: ExtraPaymentsTableProps ) => {
  const {
    data: extraPayments,
    isFetching,
    isLoading,
    refetch,
  } = useQuery( {
    queryKey: [ "extraPayments", loanId ],
    queryFn: async () => {
      const extraPayments = await fetchLoanExtraPayments( loanId );
      return extraPayments;
    },
    enabled: loanId !== "new" && loanId !== "",
  } );

  const { mutate: addExtraPayment, isPending } = useMutation( {
    mutationFn: async ( data: Prisma.LoanExtraPaymentsCreateInput ) => {
      await createLoanExtraPayments( {
        ...data,
      } );
    },
    onSuccess: () => {
      refetch();
    },
  } );

  const { mutate: updateExtraPayment, isPending: isUpdatePending } =
    useMutation( {
      mutationFn: async ( {
        id,
        data,
      }: {
        id: LoanExtraPayments[ "id" ];
        data: Prisma.LoanExtraPaymentsUpdateInput;
      } ) => {
        await updateLoanExtraPayments( id, data );
      },
      onSuccess: () => {
        refetch();
      },
    } );

  const { mutate: deleteExtraPayment, isPending: isDeletePending } =
    useMutation( {
      mutationFn: async ( id: LoanExtraPayments[ "id" ] ) => {
        await deleteLoanExtraPayments( id );
      },
      onSuccess: () => {
        refetch();
      },
    } );

  if ( isLoading || isFetching ) return <Loader />;

  return (
    <div className={cn( "mt-2 flex flex-1 flex-col", className )}>
      <DataTableBasic
        title="Extra Payments"
        data={extraPayments || []}
        columns={columns}
        getRowId={( row ) => row.id}
        defaultSorting={[ { id: "date", desc: true } ]}
        defaultColumnVisibility={{ id: false }}
        refetch={() => refetch()}
        rowEditFormaAsDialog
        rowEditForm={( props ) => (
          <DataTableRowEditForm
            {...props}
            defaultData={defaultData}
            zodSchema={LoanExtraPaymentSchema}
          />
        )}
        updateData={( { rowId, rowData } ) => {
          // console.log("updateData", { rowId, rowData });
          if ( rowId === "-1" )
            addExtraPayment( { ...rowData, loan: { connect: { id: loanId } } } );
          else updateExtraPayment( { id: rowId, data: rowData } );
        }}
        deleteData={( { rowId, rowData } ) => {
          // console.log("deleteData", { rowId, rowData });
          const id = rowData?.id || rowId;
          if ( id ) deleteExtraPayment( id );
        }}
      />
    </div>
  );
};

export default ExtraPaymentsTable;
