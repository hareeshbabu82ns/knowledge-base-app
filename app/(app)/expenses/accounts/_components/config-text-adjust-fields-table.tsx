"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { getAccountDetails, updateAccount } from "../actions";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import Loader from "@/components/shared/loader";
import { createColumnHelper } from "@tanstack/react-table";
import { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import {
  ConfigTextAdjustFieldsSchema,
  IConfig,
  IConfigText,
} from "@/types/expenses";
import DataTableRowEditForm from "@/components/data-table/datatable-row-edit-form";
import { Option } from "@/components/ui/multi-select";

const columnHelper = createColumnHelper<IConfigText>();
const columns = [
  columnHelper.accessor("scope", {
    id: "scope",
    header: "scope",
    meta: {
      cellInputVariant: "select",
      filterVariant: "select",
      filterOptions: [{ label: "Line", value: "line" }] as Option[],
    },
  }),
  columnHelper.accessor("source", {
    id: "source",
    header: "Source",
    meta: {
      cellInputVariant: "text",
    },
  }),
  columnHelper.accessor("replaceWith", {
    id: "replaceWith",
    header: "Replace With",
    meta: {
      cellInputVariant: "text",
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 50,
    cell: ({ row, table, column }) => (
      <div className="flex flex-row gap-1">
        {row.getIsEditing() && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              row.toggleEditing();
            }}
          >
            <Icons.close className="size-4" />
          </Button>
        )}
        {row.getCanEdit() && !row.getIsEditing() && (
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
        <Button
          variant="ghost"
          className="text-destructive size-8 p-2"
          disabled={!table.options.meta?.deleteData}
          onClick={() => {
            table.options.meta?.deleteData!(row.id, row.original);
          }}
        >
          <Icons.trash className="size-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
  }),
];

interface AccountTextAdjustFieldsTableProps {
  className?: string;
  accountId: string;
}

const defaultData: IConfigText = {
  scope: "line",
  source: "",
  replaceWith: "",
};

const AccountTextAdjustFieldsTable = ({
  className,
  accountId,
}: AccountTextAdjustFieldsTableProps) => {
  const {
    data: account,
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["account", accountId],
    queryFn: async () => {
      const account = await getAccountDetails(accountId);
      return account;
    },
    enabled: accountId !== "new" && accountId !== "",
  });

  const { mutate: addAccountTextAdjustFields, isPending } = useMutation({
    mutationFn: async (data: IConfigText) => {
      const config = account?.config as unknown as IConfig;
      const newFileFields = [
        ...(config.textToAdjust || []),
        {
          ...data,
        },
      ];
      const newConfig = { ...config, textToAdjust: newFileFields };
      await updateAccount(accountId, {
        config: (newConfig as unknown as Prisma.JsonValue) || {},
      });
    },
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: updateAccountTextAdjustFields, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async ({
        index,
        data,
      }: {
        index: number;
        data: IConfigText;
      }) => {
        const config = account?.config as unknown as IConfig;
        const textToAdjust = config?.textToAdjust || [];
        const newFileField = { ...(textToAdjust[index] || {}), ...data };
        const newFileFields = [
          ...textToAdjust.slice(0, index),
          newFileField,
          ...textToAdjust.slice(index + 1),
        ];
        // console.log("newFileFields", newFileFields);
        const newConfig = { ...config, textToAdjust: newFileFields };
        await updateAccount(accountId, {
          config: (newConfig as unknown as Prisma.JsonValue) || {},
        });
      },
      onSuccess: () => {
        refetch();
      },
    });

  const { mutate: deleteAccountTextAdjustFields, isPending: isDeletePending } =
    useMutation({
      mutationFn: async (index: number) => {
        const config = account?.config as unknown as IConfig;
        const textToAdjust = config?.textToAdjust || [];
        const newFileFields = [
          ...textToAdjust.slice(0, index),
          ...textToAdjust.slice(index + 1),
        ];
        const newConfig = { ...config, textToAdjust: newFileFields };
        await updateAccount(accountId, {
          config: (newConfig as unknown as Prisma.JsonValue) || {},
        });
      },
      onSuccess: () => {
        refetch();
      },
    });

  if (isLoading || isFetching) return <Loader />;

  const config = account?.config as unknown as IConfig;

  return (
    <div className={cn("mt-2 flex flex-1 flex-col", className)}>
      <DataTableBasic
        title="TextAdjust"
        data={config.textToAdjust || []}
        columns={columns}
        enableMultiRowEdit={false}
        defaultPagination={{ pageSize: 10, pageIndex: 0 }}
        defaultSorting={[{ id: "source", desc: false }]}
        defaultColumnVisibility={{}}
        refetch={() => refetch()}
        rowEditFormaAsDialog
        rowEditForm={(props) => (
          <DataTableRowEditForm
            {...props}
            defaultData={defaultData}
            zodSchema={ConfigTextAdjustFieldsSchema}
          />
        )}
        updateData={({ rowId, rowData }) => {
          const rowIndex = Number(rowId);
          // console.log("updateData", { rowIndex, columnId, value, rowData });
          rowIndex < 0
            ? addAccountTextAdjustFields(rowData)
            : updateAccountTextAdjustFields({ index: rowIndex, data: rowData });
        }}
        updateCellData={({ rowId, rowData, columnId, value }) => {
          const rowIndex = Number(rowId);
          // console.log("updateData", { rowIndex, columnId, value, rowData });
          const newFileField = {
            ...rowData,
            ...{ [columnId]: value },
          };
          updateAccountTextAdjustFields({
            index: rowIndex,
            data: newFileField,
          });
        }}
        deleteData={(rowId, rowData) => {
          const rowIndex = Number(rowId);
          // console.log("deleteData", { rowIndex, rowData });
          deleteAccountTextAdjustFields(rowIndex);
        }}
      />
    </div>
  );
};

export default AccountTextAdjustFieldsTable;
