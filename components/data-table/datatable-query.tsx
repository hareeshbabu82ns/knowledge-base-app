"use client";

import {
  ColumnDef,
  ColumnDefTemplate,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  Row,
  SortingState,
  Updater,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { DataTablePagination } from "@/components/data-table/datatable-pagination";
import { DataTableHeader } from "@/components/data-table/datatable-header";
import { DataTableColumnHeader } from "@/components/data-table/datatable-column-header";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/components/data-table/datatable-filters";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Loader from "../shared/loader";
import { cn } from "@/lib/utils";
import { RowSelectionFormProps } from "./types";
import { RowEditFeature, RowEditState } from "./datatable-feature-row-editing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import DataTableCellInput from "./datatable-cell-input";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Icons } from "../shared/icons";

interface MutationResponse {
  success?: boolean;
  message?: string;
}

interface DataTableProps<TData, TValue> {
  title?: React.ReactNode;
  columns: ColumnDef<TData, any>[];
  defaultSorting?: SortingState;
  defaultPagination?: PaginationState;
  defaultColumnFilters?: ColumnFiltersState;
  defaultColumnVisibility?: VisibilityState;
  className?: string;
  queryKey: string;
  queryFn: (params: {
    pagination: PaginationState;
    sorting: SortingState;
    filters: ColumnFiltersState;
  }) => Promise<{ rowCount: number; rows: TData[] }>;
  updateFn?: (data: {
    rowId: string;
    rowData: TData;
  }) => Promise<MutationResponse | void> | MutationResponse | void;
  addFn?: (
    data: TData,
  ) => Promise<MutationResponse | void> | MutationResponse | void;
  deleteFn?: (data: {
    rowId: string;
    rowData?: TData;
  }) => Promise<MutationResponse | void> | MutationResponse | void;
  actions?: React.ReactNode;
  isFiltersOpen?: boolean;
  beforeTable?: React.ReactNode | React.ComponentType;
  enableMultiRowEdit?: boolean;
  rowEditForm?: ColumnDefTemplate<RowSelectionFormProps<TData>>;
  rowEditFormaAsDialog?: boolean;
  getRowId?:
    | ((
        originalRow: TData,
        index: number,
        parent?: Row<TData> | undefined,
      ) => string)
    | undefined;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
}

export function DataTableQuery<TData, TValue>({
  title,
  columns,
  defaultSorting = [],
  // defaultSorting = [{ id: "name", desc: false }],
  defaultPagination = {
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  defaultColumnFilters = [],
  defaultColumnVisibility = { id: false },
  className,
  queryKey,
  queryFn,
  addFn,
  updateFn,
  deleteFn,
  actions,
  getRowId = (row, id) => (row as any)?.id || `${id}`,
  isFiltersOpen = false,
  beforeTable,
  enableMultiRowEdit = true,
  rowEditForm,
  rowEditFormaAsDialog = false,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState(defaultSorting);
  const [pagination, setPagination] = React.useState(defaultPagination);
  const [columnFilters, setColumnFilters] =
    React.useState(defaultColumnFilters);
  const [columnVisibility, setColumnVisibility] = React.useState(
    defaultColumnVisibility,
  );
  const [editingRows, setEditingRows] = React.useState<RowEditState>({});
  const [isRowEditFormOpen, setIsRowEditFormOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const setColumnFiltersWithCallback = React.useCallback(
    (filters: Updater<ColumnFiltersState>) => {
      setColumnFilters(filters);
      onColumnFiltersChange && onColumnFiltersChange(filters);
    },
    [onColumnFiltersChange],
  );

  const dataQuery = useQuery({
    queryKey: [queryKey, pagination, sorting, columnFilters],
    queryFn: () => queryFn({ pagination, sorting, filters: columnFilters }),
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  const { data, isFetching, isLoading, refetch, isError, error } = dataQuery;

  const { mutate: updateMutation, isPending: isUpdatePending } = useMutation({
    mutationFn: async ({
      rowId,
      rowData,
    }: {
      rowId: string;
      rowData: TData;
    }) => {
      if (rowId && rowId !== "-1") {
        if (!updateFn) throw new Error("Update function not provided");
        return updateFn({ rowId, rowData });
      } else {
        if (!addFn) throw new Error("Add function not provided");
        return addFn(rowData);
      }
    },
    onSuccess: (response, variables) => {
      const isUpdate = variables.rowId && variables.rowId !== "-1";
      const message =
        typeof response === "object" && response?.message
          ? response.message
          : isUpdate
            ? "Item updated successfully"
            : "Item added successfully";
      toast.success(message);

      // Optimistically invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Failed to save item");
    },
    retry: 1,
  });

  const { mutate: deleteMutation, isPending: isDeletePending } = useMutation({
    mutationFn: async ({
      rowId,
      rowData,
    }: {
      rowId: string;
      rowData?: TData;
    }) => {
      if (!deleteFn) throw new Error("Delete function not provided");
      return deleteFn({ rowId, rowData });
    },
    onSuccess: (response) => {
      const message =
        typeof response === "object" && response?.message
          ? response.message
          : "Item deleted successfully";
      toast.success(message);

      // Optimistically invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete item");
    },
    retry: 1,
  });

  const defaultData = React.useMemo(() => [], []);

  const resetFilters = React.useCallback(() => {
    setSorting(defaultSorting);
    setPagination(defaultPagination);
    setColumnFilters(defaultColumnFilters);
    setColumnVisibility(defaultColumnVisibility);
  }, [
    defaultColumnFilters,
    defaultColumnVisibility,
    defaultPagination,
    defaultSorting,
  ]);

  // Memoize table meta to prevent unnecessary re-renders
  const tableMeta = React.useMemo(
    () => ({
      updateData: addFn || updateFn ? updateMutation : undefined,
      deleteData: deleteFn ? deleteMutation : undefined,
    }),
    [addFn, updateFn, updateMutation, deleteFn, deleteMutation],
  );

  const onRowEditChange = React.useCallback<OnChangeFn<RowEditState>>(
    (editingRowsUpdater) => {
      const newEditingRows =
        typeof editingRowsUpdater === "function"
          ? editingRowsUpdater(editingRows)
          : editingRowsUpdater;
      setEditingRows(newEditingRows);
      if (Object.keys(newEditingRows).length) {
        setIsRowEditFormOpen(true);
      } else {
        setIsRowEditFormOpen(false);
      }
    },
    [editingRows],
  );

  const table = useReactTable({
    _features: [RowEditFeature],
    data: data?.rows ?? defaultData,
    rowCount: data?.rowCount ?? 0,
    columns,
    meta: tableMeta,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowEdit: editingRows,
    },
    getRowId,
    onRowEditChange,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFiltersWithCallback,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableMultiRowEdit,
  });

  const editingRowId = Object.keys(editingRows)[0] || undefined;
  const editingRowData = editingRowId
    ? table.getRowModel().rowsById[editingRowId]?.original
    : undefined;

  // Error state rendering
  if (isError) {
    return (
      <div className={cn("rounded-md border", className)}>
        <div className="p-6">
          <Alert variant="destructive">
            <Icons.warning className="size-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                {error?.message || "Failed to load data. Please try again."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                <Icons.refresh className="mr-2 size-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <DataTableHeader
        table={table}
        title={title}
        resetFilters={resetFilters}
        isFiltersOpen={isFiltersOpen}
        refetch={() => refetch()}
        actions={actions}
        onRowEditFormOpen={
          rowEditForm && rowEditFormaAsDialog ? setIsRowEditFormOpen : undefined
        }
      />
      {rowEditForm &&
        !rowEditFormaAsDialog &&
        flexRender(rowEditForm, {
          key: editingRowId || "new",
          table,
          editingRows,
          rowId: editingRowId,
          editingRowData,
        })}
      {rowEditForm && rowEditFormaAsDialog && (
        <Dialog
          open={isRowEditFormOpen}
          onOpenChange={(open) => {
            if (!open) {
              table.resetRowEdit();
            }
            setIsRowEditFormOpen(open);
          }}
        >
          <DialogContent className="min-w-[90%] md:min-w-[75%] lg:min-w-[60%]">
            <DialogHeader>
              <DialogTitle>Form</DialogTitle>
            </DialogHeader>
            {flexRender(rowEditForm, {
              key: editingRowId || "new",
              table,
              editingRows,
              rowId: editingRowId,
              editingRowData,
            })}
          </DialogContent>
        </Dialog>
      )}
      {beforeTable && flexRender(beforeTable, { table })}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <DataTableColumnHeader key={header.id} header={header} />
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    // className="hover:bg-black/5 dark:hover:bg-white/5"
                    className={cn(
                      "p-2 hover:bg-black/5 dark:hover:bg-white/5",
                      cell.column.columnDef.size !== 150
                        ? `w-[${cell.column.columnDef.size}px]`
                        : "",
                    )}
                  >
                    {!rowEditForm &&
                    cell.column.columnDef.meta?.cellInputVariant &&
                    (table.options.enableMultiRowEdit ||
                      cell.row.getIsEditing()) ? (
                      <DataTableCellInput {...cell.getContext()} />
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {isFetching || isLoading ? <Loader /> : "No results"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
