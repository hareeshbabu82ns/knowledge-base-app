"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const CellDateHandler = ({
  initialDate,
  onSelect,
}: {
  initialDate: Date;
  onSelect: (date?: Date) => void;
}) => {
  const [initialValue, setInitialValue] = useState<Date | undefined>(
    initialDate,
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !initialValue && "text-muted-foreground",
          )}
        >
          <Icons.calendar className="mr-2 size-4" />
          {initialValue ? format(initialValue, "PP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={initialValue}
          onSelect={(date?: Date) => {
            setInitialValue(date);
            onSelect(date);
          }}
        />
      </PopoverContent>
    </Popover>
  );
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
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue();
      return (
        <CellDateHandler
          initialDate={initialValue}
          onSelect={(date) => {
            if (date) {
              table.options.meta?.updateData!({
                rowIndex: index,
                columnId: id,
                value: date,
              });
            }
          }}
        />
      );
    },
    filterFn: filterFnDateRange,
    meta: {
      filterVariant: "dateRange",
    },
  }),
  columnHelper.accessor("rate", {
    id: "rate",
    header: "Interest Rate (%)",
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = Number(getValue());
      return (
        <Input
          type="number"
          defaultValue={initialValue}
          onBlur={
            table.options.meta?.updateData
              ? (e) => {
                  const value = Number(e.target.value);
                  if (value !== initialValue) {
                    table.options.meta?.updateData!({
                      rowIndex: index,
                      columnId: id,
                      value,
                    });
                  }
                }
              : undefined
          }
        />
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => (
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
