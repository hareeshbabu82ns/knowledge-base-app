"use server";

import { db } from "@/lib/db";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { columns } from "./columns";
import {
  convertColumnFiltersToPrisma,
  convertSortingToPrisma,
} from "@/components/data-table/utils";

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
  // console.dir({ sorting, orderBy }, { depth: 3 });

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
