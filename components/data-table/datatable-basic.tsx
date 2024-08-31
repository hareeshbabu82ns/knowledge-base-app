"use client";

import {
  ColumnDef,
  ColumnDefTemplate,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import React from "react";
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "./datatable-filters";
import { DataTableHeader } from "./datatable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTableColumnHeader } from "./datatable-column-header";
import { DataTablePagination } from "./datatable-pagination";
import { cn } from "@/lib/utils";
import DataTableCellInput from "./datatable-cell-input";
import { RowEditFeature, RowEditState } from "./datatable-feature-row-editing";
import { RowSelectionFormProps } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  title?: React.ReactNode;
  defaultSorting?: SortingState;
  defaultPagination?: PaginationState;
  defaultColumnFilters?: ColumnFiltersState;
  defaultColumnVisibility?: VisibilityState;
  className?: string;
  refetch?: () => void;
  isFiltersOpen?: boolean;
  actions?: React.ReactNode;
  updateData?: (data: { rowId: string; rowData: TData }) => void;
  updateCellData?: (data: {
    rowId: string;
    rowData: TData;
    columnId: string;
    value: unknown;
  }) => void;
  deleteData?: (rowId: string, rowData: TData) => void;
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
}

export function DataTableBasic<TData>({
  title,
  data: tableData,
  columns,
  defaultSorting = [{ id: "name", desc: false }],
  defaultPagination = {
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  defaultColumnFilters = [],
  defaultColumnVisibility = { id: false },
  className,
  refetch,
  isFiltersOpen = false,
  actions,
  updateData,
  deleteData,
  enableMultiRowEdit = true,
  rowEditForm,
  rowEditFormaAsDialog = false,
  getRowId,
}: DataTableProps<TData>) {
  const [data, _setData] = React.useState(() => [...tableData]);

  React.useEffect(() => {
    _setData([...tableData]);
  }, [tableData]);

  const [sorting, setSorting] = React.useState(defaultSorting);
  const [pagination, setPagination] = React.useState(defaultPagination);
  const [columnFilters, setColumnFilters] =
    React.useState(defaultColumnFilters);
  const [columnVisibility, setColumnVisibility] = React.useState(
    defaultColumnVisibility,
  );
  const [editingRows, setEditingRows] = React.useState<RowEditState>({});
  const [isRowEditFormOpen, setIsRowEditFormOpen] = React.useState(false);

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
    data,
    columns,
    meta: {
      updateData,
      deleteData,
    },
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowEdit: editingRows,
    },
    getRowId,
    onSortingChange: setSorting,
    onRowEditChange,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiRowEdit,
  });

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

  const editingRowId = Object.keys(editingRows)[0] || undefined;
  const editingRowData = editingRowId
    ? table.getRowModel().rowsById[editingRowId].original
    : undefined;

  return (
    <div className={cn("rounded-md border", className)}>
      <DataTableHeader
        table={table}
        title={title}
        resetFilters={resetFilters}
        isFiltersOpen={isFiltersOpen}
        refetch={refetch}
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
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-inherit">
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
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
