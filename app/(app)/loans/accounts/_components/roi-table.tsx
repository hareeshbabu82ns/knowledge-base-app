"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import {
  createLoanRates,
  deleteLoanRates,
  fetchLoanRates,
  updateLoanRates,
} from "../actions";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import Loader from "@/components/shared/loader";
import { createColumnHelper } from "@tanstack/react-table";
import { LoanRates, Prisma } from "@prisma/client";
import { filterFnDateRange } from "@/components/data-table/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { format } from "date-fns";
import DataTableRowEditForm from "@/components/data-table/datatable-row-edit-form";
import { LoanRoiSchema } from "@/lib/validations/loans";
import { toast } from "sonner";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";

const defaultRoi: LoanRates = {
  id: "",
  date: new Date(),
  rate: 0,
  loanId: "",
};
const columnHelper = createColumnHelper<LoanRates>();
const columns = [
  columnHelper.accessor("id", {
    id: "id",
    header: "id",
  }),
  columnHelper.accessor("date", {
    id: "date",
    header: "Date",
    cell: (info: any) => (
      <p className="text-sm font-medium">{format(info.getValue(), "PP")}</p>
    ),
    filterFn: filterFnDateRange,
    meta: {
      cellInputVariant: "date",
      filterVariant: "dateRange",
    },
  }),
  columnHelper.accessor("rate", {
    id: "rate",
    header: "Interest Rate (%)",
    meta: {
      cellInputVariant: "number",
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 50,
    cell: ({ row, table, column }) => (
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
          toastId={`loan-roi-deletion-${row.id}`}
          toastLabel={`Delete ROI? ${row.original.rate}`}
          onClick={() =>
            table.options.meta?.deleteData!({
              rowId: row.id,
              rowData: row.original,
            })
          }
        >
          <Icons.trash className="size-8" />
        </DeleteConfirmButton>
      </div>
    ),
    enableSorting: false,
  }),
];

interface RoiTableProps {
  className?: string;
  loanId: string;
}

const RoiTable = ({ className, loanId }: RoiTableProps) => {
  const {
    data: rois,
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["rois", loanId],
    queryFn: async () => {
      const rates = await fetchLoanRates(loanId);
      return rates;
    },
    enabled: loanId !== "new" && loanId !== "",
  });

  const { mutate: addRoi, isPending } = useMutation({
    mutationFn: async (data: Prisma.LoanRatesCreateInput) => {
      await createLoanRates({
        ...data,
      });
    },
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: updateRoi, isPending: isUpdatePending } = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: LoanRates["id"];
      data: Prisma.LoanRatesUpdateInput;
    }) => {
      await updateLoanRates(id, data);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: deleteRoi, isPending: isDeletePending } = useMutation({
    mutationFn: async (id: LoanRates["id"]) => {
      await deleteLoanRates(id);
    },
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading || isFetching) return <Loader />;

  return (
    <div className={cn("mt-2 flex flex-1 flex-col", className)}>
      <DataTableBasic
        title="Anual Interest Rates"
        data={rois || []}
        getRowId={(row) => row.id}
        columns={columns}
        defaultSorting={[{ id: "date", desc: true }]}
        defaultColumnVisibility={{ id: false }}
        refetch={() => refetch()}
        rowEditFormaAsDialog
        rowEditForm={(props) => (
          <DataTableRowEditForm
            {...props}
            defaultData={defaultRoi}
            zodSchema={LoanRoiSchema}
          />
        )}
        updateData={({ rowId, rowData }) => {
          // console.log("updateData", { rowId, rowData });
          if (rowId === "-1")
            addRoi({ ...rowData, loan: { connect: { id: loanId } } });
          else updateRoi({ id: rowId, data: rowData });
        }}
        deleteData={({ rowId, rowData }) => {
          // console.log("deleteData", { rowIndex, rowData });
          const id = rowData?.id || rowId;
          if (id) deleteRoi(id);
        }}
      />
    </div>
  );
};

export default RoiTable;
