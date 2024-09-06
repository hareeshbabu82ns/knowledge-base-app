"use client";
import React, { useMemo } from "react";
import { ITransactionUploadRes } from "../types";
import { IConfig } from "@/types/expenses";
import { DataTableBasic } from "@/components/data-table/datatable-basic";

interface ComponentProps {
  data: ITransactionUploadRes;
  config: IConfig;
}
const TransactionFileEntriesTable = ({ data, config }: ComponentProps) => {
  const { columns, columnVisibility } = useMemo(() => {
    const columns = config.fileFields.map((fieldConfig, index) => ({
      header: data.headerLabels[index] || fieldConfig.name,
      accessorKey: fieldConfig.name,
      id: fieldConfig.name,
      meta: {
        filterVariant:
          fieldConfig.ignore || fieldConfig.expenseColumn === "none"
            ? undefined
            : "text",
      },
    }));
    const columnVisibility = config.fileFields
      .filter((f) => f.ignore || f.expenseColumn === "none")
      .reduce(
        (acc, fieldConfig) => {
          acc[fieldConfig.name] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    return { columns, columnVisibility };
  }, [config.fileFields, data.headerLabels]);
  return (
    <div>
      <DataTableBasic
        title="File Entries"
        columns={columns as any}
        defaultPagination={{ pageSize: 30, pageIndex: 0 }}
        defaultColumnVisibility={columnVisibility}
        data={data.allRecords}
      />
      {/* <pre>{JSON.stringify(data.allRecords, null, 2)}</pre> */}
    </div>
  );
};

export default TransactionFileEntriesTable;
