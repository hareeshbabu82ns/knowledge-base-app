"use client";

import React from "react";
import { Button } from "../ui/button";
import { RowEditFormProps } from "./types";
import { cn } from "@/lib/utils";
import { ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import DatatableCustomFormField from "./datatable-custom-form-field";

interface DataTableRowEditFormProps<TData> extends RowEditFormProps<TData> {
  defaultData: TData;
  className?: string;
  zodSchema: ZodType<Partial<TData>>;
}

export default function DataTableRowEditForm<TData>({
  table,
  rowId,
  editingRowData,
  defaultData,
  zodSchema,
  className,
}: DataTableRowEditFormProps<TData>) {
  const rowData = rowId && editingRowData ? editingRowData : defaultData;

  const form = useForm({
    resolver: zodResolver(zodSchema as any) as any,
    defaultValues: async () => ({ ...rowData }),
  });

  const {
    formState: { dirtyFields },
  } = form;

  const onSubmit = (values: any) => {
    if (rowId) {
      table.options.meta?.updateData!({
        rowId,
        rowData: values,
      });
    } else {
      table.options.meta?.updateData!({
        rowId: "-1",
        rowData: values,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid grid-cols-2 gap-4 gap-y-8 p-2", className)}
      >
        {table.getAllLeafColumns().map((column) => {
          const name = (column.columnDef.meta?.dbMapId || column.id) as string;
          return column.columnDef.meta?.cellInputVariant ? (
            <DatatableCustomFormField
              key={name}
              column={column}
              control={form.control}
              name={name}
              label={column.columnDef.header as string}
              placeholder={name}
            />
          ) : null;
        })}
        <div className="col-span-2 flex justify-end gap-4">
          {table.options.meta?.updateData && (
            <Button
              variant="outline"
              size="sm"
              disabled={Object.keys(dirtyFields).length === 0}
            >
              {rowId ? "Save" : "Add"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              form.reset();
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
