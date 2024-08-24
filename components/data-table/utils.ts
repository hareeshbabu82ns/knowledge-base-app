import { ColumnDef, ColumnFilter, SortingState } from "@tanstack/react-table";
import { Option } from "../ui/multi-select";

export const filterFnMultiSelect = (
  row: any,
  columnId: string,
  filterValue: any,
) => {
  const arrVal = filterValue as Option[];
  const value = row.original[columnId] as string;
  if (arrVal.length && !arrVal.some((v) => v.value === value)) return false;
  return true;
};

export const filterFnDateRange = (
  row: any,
  columnId: string,
  filterValue: any,
) => {
  const arrVal = filterValue as [string, string];
  const value = row.original[columnId] as Date;
  if (arrVal[0] && value < new Date(arrVal[0])) return false;
  if (arrVal[1] && value > new Date(arrVal[1])) return false;
  return true;
};

export const convertSortingToPrisma = (
  sorting: SortingState,
  columns: ColumnDef<any, any>[],
) => {
  // sorting [ { id: 'date', desc: true } ] to { date: 'desc' }

  return sorting.reduce((acc, { id, desc }) => {
    const column = columns.find((c) => c.id === id);
    const dbId = column?.meta?.dbMapId || id;

    if (
      column?.meta?.fieldType === "subObject" &&
      column?.meta?.subObjectLabelField
    ) {
      acc[id] = {
        [column?.meta?.subObjectLabelField]: desc ? "desc" : "asc",
      };
    } else {
      acc[dbId] = desc ? "desc" : "asc";
    }
    return acc;
  }, {} as any);
};

export const convertColumnFiltersToPrisma = (
  filters: ColumnFilter[],
  columns: ColumnDef<any, any>[],
) => {
  // filters [ { id: 'description', value: 'des*' } ] to { description: { contains: 'des' } }

  // console.dir({ columns }, { depth: 3 });
  return filters?.reduce((acc, { id, value }) => {
    const column = columns.find((c) => c.id === id);
    const dbId = column?.meta?.dbMapId || id;
    switch (column?.meta?.filterVariant) {
      case "dateRange": {
        acc[dbId] = {};
        const arrVal = value as [string, string];
        if (arrVal[0]) acc[dbId] = { ...acc[dbId], gte: new Date(arrVal[0]) };
        if (arrVal[1]) acc[dbId] = { ...acc[dbId], lte: new Date(arrVal[1]) };
        break;
      }
      case "range": {
        acc[dbId] = {};
        const arrVal = value as [string, string];
        if (arrVal[0]) acc[dbId] = { ...acc[dbId], gte: Number(arrVal[0]) };
        if (arrVal[1]) acc[dbId] = { ...acc[dbId], lte: Number(arrVal[1]) };
        break;
      }
      case "select": {
        acc[dbId] = { equals: value };
        break;
      }
      case "multiSelect": {
        const values = (value as Option[]).map((o) => o.value);
        acc[dbId] =
          column?.meta.fieldType === "array"
            ? { hasSome: values }
            : { in: values };
        break;
      }
      case "text": {
        acc[dbId] = { contains: value, mode: "insensitive" };
        break;
      }
      default: {
        acc[dbId] = { contains: value, mode: "insensitive" };
        break;
      }
    }
    // if (typeof value === "string") {
    //   if (id === "tags") {
    //     acc[id] = { hasSome: value.split(",") };
    //   } else if (id === "accountObj") {
    //     acc["account"] = { equals: value };
    //   } else acc[id] = { contains: value, mode: "insensitive" };
    // } else if (Array.isArray(value)) {
    //   if (value.length === 0) {
    //   } else if (["date", "createdAt", "updatedAt"].includes(id)) {
    //     acc[id] = {};
    //     if (value[0]) acc[id] = { ...acc[id], gte: new Date(value[0]) };
    //     if (value[1]) acc[id] = { ...acc[id], lte: new Date(value[1]) };
    //   } else if (["amount"].includes(id)) {
    //     acc[id] = {};
    //     if (value[0]) acc[id] = { ...acc[id], gte: Number(value[0]) };
    //     if (value[1]) acc[id] = { ...acc[id], lte: Number(value[1]) };
    //   } else if (["accountObj"].includes(id)) {
    //     const values = (value as Option[]).map((o) => o.value);
    //     acc["account"] = { in: values };
    //   } else if (["tags"].includes(id)) {
    //     const values = (value as Option[]).map((o) => o.value);
    //     acc[id] = { hasSome: values };
    //   } else {
    //     acc[id] = {};
    //     if (value[0]) acc[id] = { ...acc[id], gte: value[0] };
    //     if (value[1]) acc[id] = { ...acc[id], lte: value[1] };
    //   }
    // } else {
    //   acc[id] = { equals: value };
    // }
    return acc;
  }, {} as any);
};
