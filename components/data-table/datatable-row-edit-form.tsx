"use client";

import React from "react";
import { Button } from "../ui/button";
import { RowEditFormProps } from "./types";
import { cn } from "@/lib/utils";
import { ZodSchema } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import DatatableCustomFormField from "./datatable-custom-form-field";

interface DataTableRowEditFormProps<TData> extends RowEditFormProps<TData> {
  defaultData: TData;
  className?: string;
  zodSchema: ZodSchema<Partial<TData>>;
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
    resolver: zodResolver(zodSchema),
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
        className={cn("grid grid-cols-2 gap-4 p-2", className)}
      >
        {table.getAllLeafColumns().map((column) => {
          return column.columnDef.meta?.cellInputVariant ? (
            <DatatableCustomFormField
              key={column.id}
              column={column}
              control={form.control}
              name={column.id as string}
              label={column.columnDef.header as string}
              placeholder={column.id as string}
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
