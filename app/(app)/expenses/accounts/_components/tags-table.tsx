"use client";

import { cn, downloadFile } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { createTag, deleteTag, fetchTags, updateTag } from "../actions";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import Loader from "@/components/shared/loader";
import { createColumnHelper } from "@tanstack/react-table";
import { ExpenseTags, Prisma } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { TagSchema } from "@/types/expenses";
import DataTableRowEditForm from "@/components/data-table/datatable-row-edit-form";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";
import { toast } from "sonner";
import { format } from "date-fns";

const columnHelper = createColumnHelper<ExpenseTags>();
const columns = [
  columnHelper.accessor( "tag", {
    id: "tag",
    header: "Tag",
    meta: {
      cellInputVariant: "text",
      filterVariant: "text",
    },
  } ),
  columnHelper.display( {
    id: "actions",
    header: "Actions",
    size: 50,
    cell: ( { row, table, column } ) => (
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
          toastLabel={`Delete Tag Config? ${row.original.tag}`}
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

interface ExpenseTagsTableProps {
  className?: string;
}

const defaultTagOpt: ExpenseTags = {
  id: "",
  tag: "",
  userId: "",
};

const TagsTable = ( { className }: ExpenseTagsTableProps ) => {
  const {
    data: tags,
    isFetching,
    isLoading,
    refetch,
  } = useQuery( {
    queryKey: [ "tags" ],
    queryFn: async () => {
      const tags = await fetchTags();
      return tags;
    },
  } );

  const { mutate: addTagFn, isPending } = useMutation( {
    mutationFn: async ( data: Prisma.ExpenseTagsCreateInput ) => {
      await createTag( data );
    },
    onSuccess: () => {
      refetch();
    },
  } );

  const { mutate: updateTagFn, isPending: isUpdatePending } = useMutation( {
    mutationFn: async ( {
      tagId,
      data,
    }: {
      tagId: ExpenseTags[ "id" ];
      data: Prisma.ExpenseTagsUpdateInput;
    } ) => {
      await updateTag( tagId, data );
    },
    onSuccess: () => {
      refetch();
    },
  } );

  const { mutate: deleteTagFn, isPending: isDeletePending } = useMutation( {
    mutationFn: async ( tagId: string ) => {
      await deleteTag( tagId );
    },
    onSuccess: () => {
      refetch();
    },
  } );

  if ( isLoading || isFetching ) return <Loader />;

  return (
    <div className={cn( "mt-2 flex flex-1 flex-col", className )}>
      <DataTableBasic
        title="Tag Fields"
        data={tags || []}
        columns={columns}
        enableMultiRowEdit={false}
        defaultPagination={{ pageSize: 20, pageIndex: 0 }}
        defaultSorting={[ { id: "tag", desc: false } ]}
        defaultColumnVisibility={{}}
        refetch={() => refetch()}
        getRowId={( row ) => row.id}
        rowEditFormaAsDialog
        rowEditForm={( props ) => (
          <DataTableRowEditForm
            {...props}
            defaultData={defaultTagOpt}
            zodSchema={TagSchema}
          />
        )}
        updateData={( { rowId, rowData } ) => {
          rowId === "-1"
            ? addTagFn(
              { ...rowData, user: { connect: { id: "" } } },
              { onError: () => toast.error( "Tag not created" ) },
            )
            : updateTagFn(
              { tagId: rowId, data: rowData },
              { onError: () => toast.error( "Tag not updated" ) },
            );
        }}
        deleteData={( { rowId } ) => {
          deleteTagFn( rowId );
        }}
        actions={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const datePrefix = `${format( Date.now(), "y-MM-dd-HH-mm" )}`;
                const fileName = `${datePrefix}-tags.json`;
                downloadFile( {
                  fileName,
                  data: JSON.stringify( tags, null, 2 ),
                  fileType: "application/json",
                } );
              }}
            >
              <Icons.download className="size-5" />
            </Button>
          </>
        }
      />
    </div>
  );
};

export default TagsTable;
