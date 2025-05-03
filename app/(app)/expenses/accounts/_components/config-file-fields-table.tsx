"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { getAccountDetails, updateAccount } from "../actions";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import Loader from "@/components/shared/loader";
import { createColumnHelper } from "@tanstack/react-table";
import { Prisma } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import {
  ConfigFileFieldsSchema,
  IConfig,
  IConfigFileFields,
} from "@/types/expenses";
import {
  configFieldExpenseColumnOptions,
  configFieldExpenseTypeOptions,
  configFieldTypeOptions,
} from "@/variables/expenses";
import DataTableRowEditForm from "@/components/data-table/datatable-row-edit-form";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";

const columnHelper = createColumnHelper<IConfigFileFields>();
const columns = [
  columnHelper.accessor( "name", {
    id: "name",
    header: "Name",
    meta: {
      cellInputVariant: "text",
      filterVariant: "text",
    },
  } ),
  columnHelper.accessor( "type", {
    id: "type",
    header: "Type",
    meta: {
      cellInputVariant: "select",
      filterVariant: "select",
      filterOptions: configFieldTypeOptions,
    },
    cell: ( info: any ) => {
      const value = info.getValue();
      if ( !value ) return null;
      const option = configFieldTypeOptions.find( ( o ) => o.value === value );
      return option?.label || value;
    },
  } ),
  columnHelper.accessor( "format", {
    id: "format",
    header: "Format",
    meta: {
      cellInputVariant: "text",
    },
  } ),
  columnHelper.accessor( "expenseColumn", {
    id: "expenseColumn",
    header: "Expense Column",
    meta: {
      cellInputVariant: "select",
      filterVariant: "select",
      filterOptions: configFieldExpenseColumnOptions,
    },
    cell: ( info: any ) => {
      const value = info.getValue();
      if ( !value ) return null;
      const option = configFieldExpenseColumnOptions.find(
        ( o ) => o.value === value,
      );
      return option?.label || value;
    },
  } ),
  columnHelper.accessor( "expenseType", {
    id: "expenseType",
    header: "Expense Type",
    meta: {
      cellInputVariant: "select",
      filterVariant: "select",
      filterOptions: configFieldExpenseTypeOptions,
    },
    cell: ( info: any ) => {
      const value = info.getValue();
      if ( !value ) return null;
      const option = configFieldExpenseTypeOptions.find(
        ( o ) => o.value === value,
      );
      return option?.label || value;
    },
  } ),
  columnHelper.accessor( "ignore", {
    id: "ignore",
    header: "Ignore",
    meta: {
      cellInputVariant: "switch",
    },
    cell: ( info: any ) => {
      const value = info.getValue() as boolean;
      return value ? (
        <Icons.check className="size-4" />
      ) : (
        <Icons.close className="size-4" />
      );
    },
  } ),
  columnHelper.accessor( "negated", {
    id: "negated",
    header: "Negated",
    meta: {
      cellInputVariant: "switch",
    },
    cell: ( info: any ) => {
      const value = info.getValue() as boolean;
      return value ? (
        <Icons.check className="size-4" />
      ) : (
        <Icons.close className="size-4" />
      );
    },
  } ),
  columnHelper.accessor( "timeColumnIndex", {
    id: "timeColumnIndex",
    header: "Time Column Index",
    meta: {
      cellInputVariant: "number",
    },
  } ),
  columnHelper.display( {
    id: "actions",
    header: "Actions",
    size: 50,
    cell: ( { row, table, column } ) => (
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
        <DeleteConfirmButton
          variant="ghost"
          className="text-destructive size-8 p-2"
          disabled={!table.options.meta?.deleteData}
          toastId={`config-file-fields-deletion-${row.id}`}
          toastLabel={`Delete Input Field Config? ${row.original.name}`}
          onClick={() =>
            table.options.meta?.deleteData!( {
              rowId: row.id,
              rowData: row.original,
            } )
          }
        >
          <Icons.trash className="size-4" />
        </DeleteConfirmButton>
      </div>
    ),
    enableSorting: false,
  } ),
];

interface AccountFileFieldsTableProps {
  className?: string;
  accountId: string;
}

const defaultFileField: IConfigFileFields = {
  name: "",
  type: "string",
  format: "",
  expenseColumn: "",
  expenseType: "",
  ignore: false,
  negated: false,
  timeColumnIndex: 0,
};

const AccountFileFieldsTable = ( {
  className,
  accountId,
}: AccountFileFieldsTableProps ) => {
  const {
    data: account,
    isFetching,
    isLoading,
    refetch,
  } = useQuery( {
    queryKey: [ "account", accountId ],
    queryFn: async () => {
      const account = await getAccountDetails( accountId );
      return account;
    },
    enabled: accountId !== "new" && accountId !== "",
  } );

  const { mutate: addAccountFileFields, isPending } = useMutation( {
    mutationFn: async ( data: IConfigFileFields ) => {
      const config = account?.config as unknown as IConfig;
      const newFileFields = [
        ...( config.fileFields || [] ),
        {
          ...data,
        },
      ];
      const newConfig = { ...config, fileFields: newFileFields };
      await updateAccount( accountId, {
        config: ( newConfig as unknown as Prisma.JsonValue ) || {},
      } );
    },
    onSuccess: () => {
      refetch();
    },
  } );

  const { mutate: updateAccountFileFields, isPending: isUpdatePending } =
    useMutation( {
      mutationFn: async ( {
        index,
        data,
      }: {
        index: number;
        data: IConfigFileFields;
      } ) => {
        const config = account?.config as unknown as IConfig;
        const fileFields = config?.fileFields || [];
        const newFileField = { ...( fileFields[ index ] || {} ), ...data };
        const newFileFields = [
          ...fileFields.slice( 0, index ),
          newFileField,
          ...fileFields.slice( index + 1 ),
        ];
        // console.log("newFileFields", newFileFields);
        const newConfig = { ...config, fileFields: newFileFields };
        await updateAccount( accountId, {
          config: ( newConfig as unknown as Prisma.JsonValue ) || {},
        } );
      },
      onSuccess: () => {
        refetch();
      },
    } );

  const { mutate: deleteAccountFileFields, isPending: isDeletePending } =
    useMutation( {
      mutationFn: async ( index: number ) => {
        const config = account?.config as unknown as IConfig;
        const fileFields = config?.fileFields || [];
        const newFileFields = [
          ...fileFields.slice( 0, index ),
          ...fileFields.slice( index + 1 ),
        ];
        const newConfig = { ...config, fileFields: newFileFields };
        await updateAccount( accountId, {
          config: ( newConfig as unknown as Prisma.JsonValue ) || {},
        } );
      },
      onSuccess: () => {
        refetch();
      },
    } );

  if ( isLoading || isFetching ) return <Loader />;

  const config = account?.config as unknown as IConfig;

  return (
    <div className={cn( "mt-2 flex flex-1 flex-col", className )}>
      <DataTableBasic
        title="Input File Fields"
        data={config.fileFields || []}
        columns={columns}
        enableMultiRowEdit={false}
        defaultPagination={{ pageSize: 10, pageIndex: 0 }}
        defaultSorting={[ { id: "name", desc: false } ]}
        defaultColumnVisibility={{}}
        refetch={() => refetch()}
        rowEditFormaAsDialog
        rowEditForm={( props ) => (
          <DataTableRowEditForm
            {...props}
            defaultData={defaultFileField}
            zodSchema={ConfigFileFieldsSchema}
          />
        )}
        updateData={( { rowId, rowData } ) => {
          const rowIndex = Number( rowId );
          // console.log("updateData", { rowIndex, columnId, value, rowData });
          rowIndex < 0
            ? addAccountFileFields( rowData )
            : updateAccountFileFields( { index: rowIndex, data: rowData } );
        }}
        updateCellData={( { rowId, rowData, columnId, value } ) => {
          const rowIndex = Number( rowId );
          // console.log("updateData", { rowIndex, columnId, value, rowData });
          const newFileField = {
            ...rowData,
            ...{ [ columnId ]: value },
          };
          updateAccountFileFields( { index: rowIndex, data: newFileField } );
        }}
        deleteData={( { rowId, rowData } ) => {
          const rowIndex = Number( rowId );
          // console.log("deleteData", { rowIndex, rowData });
          deleteAccountFileFields( rowIndex );
        }}
      />
    </div>
  );
};

export default AccountFileFieldsTable;
