"use server";

import { db } from "@/lib/db";
import {
  ColumnFilter,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
// import { ExpenseTransaction, Prisma } from "@prisma/client";

const convertColumnFiltersToPrisma = (filters?: ColumnFilter[]) => {
  return filters?.reduce((acc, { id, value }) => {
    if (typeof value === "string") {
      if (id === "tags") {
        acc[id] = { hasSome: value.split(",") };
      } else if (id === "accountObj") {
        acc["account"] = { equals: value };
      } else acc[id] = { contains: value, mode: "insensitive" };
    } else if (Array.isArray(value) && value.length === 2) {
      if (["date", "createdAt", "updatedAt"].includes(id)) {
        acc[id] = {};
        if (value[0]) acc[id] = { ...acc[id], gte: new Date(value[0]) };
        if (value[1]) acc[id] = { ...acc[id], lte: new Date(value[1]) };
      } else if (["amount"].includes(id)) {
        acc[id] = {};
        if (value[0]) acc[id] = { ...acc[id], gte: Number(value[0]) };
        if (value[1]) acc[id] = { ...acc[id], lte: Number(value[1]) };
      } else {
        acc[id] = {};
        if (value[0]) acc[id] = { ...acc[id], gte: value[0] };
        if (value[1]) acc[id] = { ...acc[id], lte: value[1] };
      }
    }
    return acc;
  }, {} as any);
};

export const fetchTransactions = async ({
  pagination,
  sorting,
  filters,
}: {
  pagination: PaginationState;
  sorting?: SortingState;
  filters?: ColumnFiltersState;
}) => {
  // filters [ { id: 'description', value: 'des*' } ] to { description: { contains: 'des' } }
  const where = convertColumnFiltersToPrisma(filters);

  // sorting [ { id: 'date', desc: true } ] to { date: 'desc' }
  const orderBy = sorting?.reduce((acc, { id, desc }) => {
    acc[id] = desc ? "desc" : "asc";
    return acc;
  }, {} as any);

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
