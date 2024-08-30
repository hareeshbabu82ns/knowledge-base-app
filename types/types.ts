import {
  RowEditInstance,
  RowEditOptions,
  RowEditRow,
  RowEditTableState,
} from "@/components/data-table/datatable-feature-row-editing";
import { Option } from "@/components/ui/multi-select";
import { RowData } from "@tanstack/react-table";
import { ComponentType, ReactNode } from "react";

export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
}

export interface IRoute {
  path: string;
  name: string;
  layout?: string;
  exact?: boolean;
  component?: ComponentType;
  disabled?: boolean;
  icon?: JSX.Element;
  secondary?: boolean;
  collapse?: boolean;
  items?: IRoute[];
  rightElement?: boolean;
  invisible?: boolean;
}

declare global {
  var Paddle: any;
}

declare module "@tanstack/react-table" {
  interface TableState extends RowEditTableState {}

  interface TableOptionsResolved<TData extends RowData>
    extends RowEditOptions<TData> {}

  interface Table<TData extends RowData> extends RowEditInstance<TData> {}

  interface Row<TData extends RowData> extends RowEditRow {}

  interface TableMeta<TData extends RowData> {
    deleteData?: (rowIndex: number, rowData: TData) => void;
    updateData?: (data: { rowIndex: number; rowData: TData }) => void;
    updateCellData?: (data: {
      rowIndex: number;
      rowData: TData;
      columnId: string;
      value: unknown;
    }) => void;
  }

  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    cellInputVariant?:
      | "text"
      | "number"
      | "switch"
      | "select"
      | "multiSelect"
      | "date"
      | "dateRange";
    filterVariant?:
      | "text"
      | "range"
      | "select"
      | "multiSelect"
      | "date"
      | "dateRange";
    filterOptions?: Option[];
    filterOptionsFn?: () => Promise<Option[] | undefined>;
    dbMapId?: string;
    fieldType?: "array" | "subObject";
    subObjectLabelField?: string;
  }
}
