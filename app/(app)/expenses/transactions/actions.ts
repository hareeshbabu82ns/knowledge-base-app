"use server";

import { Option } from "@/components/ui/multi-select";
import { db } from "@/lib/db";
import {
  ColumnFilter,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { columns } from "./columns";
import {
  convertColumnFiltersToPrisma,
  convertSortingToPrisma,
} from "@/components/data-table/utils";

// const convertSortingToPrisma = (sorting?: SortingState) => {
//   // sorting [ { id: 'date', desc: true } ] to { date: 'desc' }

//   return sorting?.reduce((acc, { id, desc }) => {
//     const column = columns.find((c: any) => c.accessorKey === id);
//     const dbId = column?.meta?.dbMapId || id;

//     if (
//       column?.meta?.fieldType === "subObject" &&
//       column?.meta?.subObjectLabelField
//     ) {
//       acc[id] = {
//         [column?.meta?.subObjectLabelField]: desc ? "desc" : "asc",
//       };
//     } else {
//       acc[dbId] = desc ? "desc" : "asc";
//     }
//     return acc;
//     // if (id === "accountObj") {
//     //   acc["accountObj"] = { name: desc ? "desc" : "asc" };
//     // } else {
//     //   acc[id] = desc ? "desc" : "asc";
//     // }
//     // return acc;
//   }, {} as any);
// };

// const convertColumnFiltersToPrisma = (filters?: ColumnFilter[]) => {
//   // filters [ { id: 'description', value: 'des*' } ] to { description: { contains: 'des' } }

//   // console.dir({ columns }, { depth: 3 });
//   return filters?.reduce((acc, { id, value }) => {
//     const column = columns.find((c: any) => c.accessorKey === id);
//     const dbId = column?.meta?.dbMapId || id;
//     switch (column?.meta?.filterVariant) {
//       case "dateRange": {
//         acc[dbId] = {};
//         const arrVal = value as [string, string];
//         if (arrVal[0]) acc[dbId] = { ...acc[dbId], gte: new Date(arrVal[0]) };
//         if (arrVal[1]) acc[dbId] = { ...acc[dbId], lte: new Date(arrVal[1]) };
//         break;
//       }
//       case "range": {
//         acc[dbId] = {};
//         const arrVal = value as [string, string];
//         if (arrVal[0]) acc[dbId] = { ...acc[dbId], gte: Number(arrVal[0]) };
//         if (arrVal[1]) acc[dbId] = { ...acc[dbId], lte: Number(arrVal[1]) };
//         break;
//       }
//       case "select": {
//         acc[dbId] = { equals: value };
//         break;
//       }
//       case "multiSelect": {
//         const values = (value as Option[]).map((o) => o.value);
//         acc[dbId] =
//           column?.meta.fieldType === "array"
//             ? { hasSome: values }
//             : { in: values };
//         break;
//       }
//       case "text": {
//         acc[dbId] = { contains: value, mode: "insensitive" };
//         break;
//       }
//       default: {
//         acc[dbId] = { contains: value, mode: "insensitive" };
//         break;
//       }
//     }
//     // if (typeof value === "string") {
//     //   if (id === "tags") {
//     //     acc[id] = { hasSome: value.split(",") };
//     //   } else if (id === "accountObj") {
//     //     acc["account"] = { equals: value };
//     //   } else acc[id] = { contains: value, mode: "insensitive" };
//     // } else if (Array.isArray(value)) {
//     //   if (value.length === 0) {
//     //   } else if (["date", "createdAt", "updatedAt"].includes(id)) {
//     //     acc[id] = {};
//     //     if (value[0]) acc[id] = { ...acc[id], gte: new Date(value[0]) };
//     //     if (value[1]) acc[id] = { ...acc[id], lte: new Date(value[1]) };
//     //   } else if (["amount"].includes(id)) {
//     //     acc[id] = {};
//     //     if (value[0]) acc[id] = { ...acc[id], gte: Number(value[0]) };
//     //     if (value[1]) acc[id] = { ...acc[id], lte: Number(value[1]) };
//     //   } else if (["accountObj"].includes(id)) {
//     //     const values = (value as Option[]).map((o) => o.value);
//     //     acc["account"] = { in: values };
//     //   } else if (["tags"].includes(id)) {
//     //     const values = (value as Option[]).map((o) => o.value);
//     //     acc[id] = { hasSome: values };
//     //   } else {
//     //     acc[id] = {};
//     //     if (value[0]) acc[id] = { ...acc[id], gte: value[0] };
//     //     if (value[1]) acc[id] = { ...acc[id], lte: value[1] };
//     //   }
//     // } else {
//     //   acc[id] = { equals: value };
//     // }
//     return acc;
//   }, {} as any);
// };

export const fetchTransactions = async ({
  pagination,
  sorting,
  filters,
}: {
  pagination: PaginationState;
  sorting: SortingState;
  filters: ColumnFiltersState;
}) => {
  const where = convertColumnFiltersToPrisma(filters, columns);
  // console.dir({ filters, where }, { depth: 3 });

  const orderBy = convertSortingToPrisma(sorting, columns);
  console.dir({ sorting, orderBy }, { depth: 3 });

  const expenseTransactionCount = await db.expenseTransaction.count({ where });

  const transactions = await db.expenseTransaction.findMany({
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: sorting?.length ? (orderBy as any) : { id: "desc" },
    where,
    select: {
      id: true,
      account: true,
      amount: true,
      description: true,
      type: true,
      tags: true,
      date: true,
      accountObj: true,
    },
  });
  return { rowCount: expenseTransactionCount, rows: transactions };
};
