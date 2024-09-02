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
  ConfigIgnoreFieldsSchema,
  IConfig,
  IConfigIgnoreOptions,
} from "@/types/expenses";
import { configComparisionOptions } from "@/variables/expenses";
import DataTableRowEditForm from "@/components/data-table/datatable-row-edit-form";
import { Option } from "@/components/ui/multi-select";

const columnHelper = createColumnHelper<IConfigIgnoreOptions>();
const columns = [
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    meta: {
      cellInputVariant: "select",
      filterVariant: "select",
      filterOptions: [
        { label: "Description", value: "description" },
      ] as Option[],
    },
  }),
  columnHelper.accessor("comparision", {
    id: "comparision",
    header: "Comparision",
    meta: {
      cellInputVariant: "select",
      filterVariant: "select",
      filterOptions: configComparisionOptions,
    },
    cell: (info: any) => {
      const value = info.getValue();
      if (!value) return null;
      const option = configComparisionOptions.find((o) => o.value === value);
      return option?.label || value;
    },
  }),
  columnHelper.accessor("value", {
    id: "value",
    header: "value",
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

interface AccountIgnoreFieldsTableProps {
  className?: string;
  accountId: string;
}

const defaultData: IConfigIgnoreOptions = {
  name: "description",
  comparision: "CONTAINS",
  value: "",
};

const AccountIgnoreFieldsTable = ({
  className,
  accountId,
}: AccountIgnoreFieldsTableProps) => {
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

  const { mutate: addAccountIgnoreFields, isPending } = useMutation({
    mutationFn: async (data: IConfigIgnoreOptions) => {
      const config = account?.config as unknown as IConfig;
      const newFileFields = [
        ...(config.ignoreOps || []),
        {
          ...data,
        },
      ];
      const newConfig = { ...config, ignoreOps: newFileFields };
      await updateAccount(accountId, {
        config: (newConfig as unknown as Prisma.JsonValue) || {},
      });
    },
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: updateAccountIgnoreFields, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async ({
        index,
        data,
      }: {
        index: number;
        data: IConfigIgnoreOptions;
      }) => {
        const config = account?.config as unknown as IConfig;
        const ignoreOps = config?.ignoreOps || [];
        const newFileField = { ...(ignoreOps[index] || {}), ...data };
        const newFileFields = [
          ...ignoreOps.slice(0, index),
          newFileField,
          ...ignoreOps.slice(index + 1),
        ];
        // console.log("newFileFields", newFileFields);
        const newConfig = { ...config, ignoreOps: newFileFields };
        await updateAccount(accountId, {
          config: (newConfig as unknown as Prisma.JsonValue) || {},
        });
      },
      onSuccess: () => {
        refetch();
      },
    });

  const { mutate: deleteAccountIgnoreFields, isPending: isDeletePending } =
    useMutation({
      mutationFn: async (index: number) => {
        const config = account?.config as unknown as IConfig;
        const ignoreOps = config?.ignoreOps || [];
        const newFileFields = [
          ...ignoreOps.slice(0, index),
          ...ignoreOps.slice(index + 1),
        ];
        const newConfig = { ...config, ignoreOps: newFileFields };
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
        title="Ignore Fields"
        data={config.ignoreOps || []}
        columns={columns}
        enableMultiRowEdit={false}
        defaultPagination={{ pageSize: 10, pageIndex: 0 }}
        defaultSorting={[{ id: "comparision", desc: false }]}
        defaultColumnVisibility={{}}
        refetch={() => refetch()}
        rowEditFormaAsDialog
        rowEditForm={(props) => (
          <DataTableRowEditForm
            {...props}
            defaultData={defaultData}
            zodSchema={ConfigIgnoreFieldsSchema}
          />
        )}
        updateData={({ rowId, rowData }) => {
          const rowIndex = Number(rowId);
          // console.log("updateData", { rowIndex, columnId, value, rowData });
          rowIndex < 0
            ? addAccountIgnoreFields(rowData)
            : updateAccountIgnoreFields({ index: rowIndex, data: rowData });
        }}
        updateCellData={({ rowId, rowData, columnId, value }) => {
          const rowIndex = Number(rowId);
          // console.log("updateData", { rowIndex, columnId, value, rowData });
          const newFileField = {
            ...rowData,
            ...{ [columnId]: value },
          };
          updateAccountIgnoreFields({ index: rowIndex, data: newFileField });
        }}
        deleteData={(rowId, rowData) => {
          const rowIndex = Number(rowId);
          // console.log("deleteData", { rowIndex, rowData });
          deleteAccountIgnoreFields(rowIndex);
        }}
      />
    </div>
  );
};

export default AccountIgnoreFieldsTable;
