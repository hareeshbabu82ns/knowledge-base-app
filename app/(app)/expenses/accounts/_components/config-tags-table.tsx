"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { fetchTags, getAccountDetails, updateAccount } from "../actions";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import Loader from "@/components/shared/loader";
import { createColumnHelper, filterFns } from "@tanstack/react-table";
import { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import {
  ConfigTagFieldsSchema,
  IConfig,
  IConfigTagOptions,
} from "@/types/expenses";
import {
  configComparisionOptions,
  configTagNameOptions,
} from "@/variables/expenses";
import { Badge } from "@/components/ui/badge";
import DataTableRowEditForm from "@/components/data-table/datatable-row-edit-form";
import { toast } from "sonner";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";

const columnHelper = createColumnHelper<IConfigTagOptions>();
const columns = [
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    meta: {
      cellInputVariant: "select",
      filterOptions: configTagNameOptions,
    },
    cell: (info: any) => {
      const value = info.getValue();
      if (!value) return null;
      const option = configTagNameOptions.find((o) => o.value === value);
      return option?.label || value;
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
    header: "Value",
    meta: {
      cellInputVariant: "text",
      filterVariant: "text",
    },
  }),
  columnHelper.accessor("tags", {
    id: "tags",
    header: "Tags",
    filterFn: filterFns.arrIncludes,
    meta: {
      cellInputVariant: "text",
      filterVariant: "select",
      fieldType: "array",
      filterOptionsFn: async () => {
        const tags = await fetchTags();
        return tags.map((tag) => ({
          label: tag.tag,
          value: tag.tag,
        }));
      },
    },
    cell: (info: any) => {
      const value = info.getValue();
      const tags = Array.isArray(value)
        ? value
        : value
          ? (value as string).split(",")
          : [];
      return (
        <div className="flex flex-row gap-1 text-sm font-medium">
          {tags.map((tag: string, i: number) => (
            <Badge variant="outline" key={`${tag}-${i}`}>
              {tag}
            </Badge>
          ))}
        </div>
      );
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
          toastId={`config-tags-deletion-${row.id}`}
          toastLabel={`Delete Tag Config? ${row.original.name}`}
          onClick={() => table.options.meta?.deleteData!(row.id, row.original)}
        >
          <Icons.trash className="size-8" />
        </DeleteConfirmButton>
      </div>
    ),
    enableSorting: false,
  }),
];

interface AccountTagFieldsTableProps {
  className?: string;
  accountId: string;
}

const defaultTagOpt: IConfigTagOptions = {
  comparision: "STARTS_WITH",
  name: "description",
  value: "",
  tags: [],
};

const AccountTagFieldsTable = ({
  className,
  accountId,
}: AccountTagFieldsTableProps) => {
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

  const { mutate: addAccountTagFields, isPending } = useMutation({
    mutationFn: async (data: IConfigTagOptions) => {
      const config = account?.config as unknown as IConfig;
      const newTagOps = [
        ...(config.tagOps || []),
        {
          ...data,
        },
      ];
      const newConfig = { ...config, tagOps: newTagOps };
      await updateAccount(accountId, {
        config: (newConfig as unknown as Prisma.JsonValue) || {},
      });
    },
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: updateAccountTagFields, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async ({
        index,
        data,
      }: {
        index: number;
        data: IConfigTagOptions;
      }) => {
        const config = account?.config as unknown as IConfig;
        const tagOpts = config?.tagOps || [];
        const newTagOpt = { ...(tagOpts[index] || {}), ...data };
        const newTagOps = [
          ...tagOpts.slice(0, index),
          newTagOpt,
          ...tagOpts.slice(index + 1),
        ];
        const newConfig = { ...config, tagOps: newTagOps };
        await updateAccount(accountId, {
          config: (newConfig as unknown as Prisma.JsonValue) || {},
        });
      },
      onSuccess: () => {
        refetch();
      },
    });

  const { mutate: deleteAccountTagFields, isPending: isDeletePending } =
    useMutation({
      mutationFn: async (index: number) => {
        const config = account?.config as unknown as IConfig;
        const tagOpts = config?.tagOps || [];
        const newTagOps = [
          ...tagOpts.slice(0, index),
          ...tagOpts.slice(index + 1),
        ];
        const newConfig = { ...config, tagOps: newTagOps };
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
        title="Tag Fields"
        data={config.tagOps || []}
        columns={columns}
        enableMultiRowEdit={false}
        defaultPagination={{ pageSize: 10, pageIndex: 0 }}
        defaultSorting={[{ id: "value", desc: false }]}
        defaultColumnVisibility={{}}
        refetch={() => refetch()}
        rowEditFormaAsDialog
        rowEditForm={(props) => (
          <DataTableRowEditForm
            {...props}
            defaultData={defaultTagOpt}
            zodSchema={ConfigTagFieldsSchema}
          />
        )}
        updateData={({ rowId, rowData }) => {
          const rowIndex = Number(rowId);
          rowIndex < 0
            ? addAccountTagFields(rowData)
            : updateAccountTagFields({ index: rowIndex, data: rowData });
        }}
        updateCellData={({ rowId, rowData, columnId, value }) => {
          const rowIndex = Number(rowId);
          const newTagOpt = {
            ...rowData,
            ...{ [columnId]: value },
          };
          updateAccountTagFields({ index: rowIndex, data: rowData });
        }}
        deleteData={(rowId) => {
          const rowIndex = Number(rowId);
          deleteAccountTagFields(rowIndex);
        }}
      />
    </div>
  );
};

export default AccountTagFieldsTable;
