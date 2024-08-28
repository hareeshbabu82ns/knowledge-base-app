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
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          disabled={!table.options.meta?.deleteData}
          onClick={() => {
            table.options.meta?.deleteData!(row.index, row.original);
          }}
        >
          <Icons.trash className="size-4" />
        </Button>
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
    mutationFn: async () => {
      await createLoanRates({
        date: new Date(),
        rate: 0,
        loan: { connect: { id: loanId } },
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
      // refetch();
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
        columns={columns}
        defaultSorting={[{ id: "date", desc: true }]}
        defaultColumnVisibility={{ id: false }}
        refetch={() => refetch()}
        actions={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addRoi()}
              disabled={isPending}
            >
              <Icons.add className="size-5" />
            </Button>
          </>
        }
        updateData={({ rowIndex, columnId, value }) => {
          // console.log("updateData", { rowIndex, columnId, value });
          const id = rois ? rois[rowIndex]?.id : undefined;
          if (id) updateRoi({ id, data: { [columnId]: value } });
        }}
        deleteData={(rowIndex, rowData) => {
          // console.log("deleteData", { rowIndex, rowData });
          const id = rowData.id;
          if (id) deleteRoi(id);
        }}
      />
    </div>
  );
};

export default RoiTable;
