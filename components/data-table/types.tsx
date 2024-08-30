import { Table } from "@tanstack/react-table";
import { RowEditState } from "./datatable-feature-row-editing";

export interface RowSelectionFormProps<TData> {
  table: Table<TData>;
  editingRows: RowEditState;
}
