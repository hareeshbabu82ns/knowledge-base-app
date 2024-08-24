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
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
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
