"use client";

import React, { useEffect } from "react";
import DataTableFormInput from "./datatable-form-input";
import { Button } from "../ui/button";
import { RowSelectionFormProps } from "./types";
import { cn } from "@/lib/utils";

interface DataTableRowSelectionFormProps<TData>
  extends RowSelectionFormProps<TData> {
  defaultData: TData;
  className?: string;
}

export default function DataTableRowSelectionForm<TData>({
  table,
  editingRows,
  defaultData,
  className,
}: DataTableRowSelectionFormProps<TData>) {
  const [rowData, setRowData] = React.useState<TData>(defaultData);
  useEffect(() => {
    const rowId = Object.keys(editingRows)[0] || null;
    setRowData(
      rowId ? table.getRowModel().rowsById[rowId].original : defaultData,
    );
  }, [defaultData, editingRows, table]);
  // console.log({ rowData, editingRows });
  const rowId = Object.keys(editingRows)[0] || null;

  return (
    <div className={cn("grid grid-cols-2 gap-4 p-2", className)}>
      {table.getAllLeafColumns().map((column) => {
        return column.columnDef.meta?.cellInputVariant ? (
          <DataTableFormInput
            key={column.id}
            column={column}
            table={table}
            onChange={(data) => setRowData((v) => ({ ...v, ...data }))}
            rowData={rowData}
            value={rowData[column.id as keyof TData]}
          />
        ) : null;
      })}
      <div className="col-span-2 flex justify-end gap-4">
        {table.options.meta?.updateData && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log({ rowId, rowData });
              // table.updateRow(rowId, rowData);
              table.options.meta?.updateData!({
                rowIndex: rowId ? Number(rowId) : -1,
                rowData: rowData,
              });
            }}
          >
            {rowId ? "Save" : "Add"}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.resetRowEdit();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
