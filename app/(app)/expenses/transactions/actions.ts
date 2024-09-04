"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
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
import {
  IExpTransAmountByAttrStats,
  IExpTransAmountByAttrStatsArray,
  IExpTransByAttrStats,
} from "@/types/expenses";

export const fetchTransactions = async ({
  pagination,
  sorting,
  filters,
}: {
  pagination: PaginationState;
  sorting: SortingState;
  filters: ColumnFiltersState;
}) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const where = convertColumnFiltersToPrisma(filters, columns);
  // console.dir({ filters, where }, { depth: 3 });

  const orderBy = convertSortingToPrisma(sorting, columns);
  // console.dir({ sorting, orderBy }, { depth: 3 });

  const expenseTransactionCount = await db.expenseTransaction.count({ where });

  const transactions = await db.expenseTransaction.findMany({
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: sorting?.length ? (orderBy as any) : { id: "desc" },
    where: { ...where, userId: session.user.id },
    include: { accountObj: true },
  });
  return { rowCount: expenseTransactionCount, rows: transactions };
};

export const fetchChartAccountsByMonth = async ({
  filters,
}: {
  filters: ColumnFiltersState;
}) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const where = convertColumnFiltersToPrisma(filters, columns);
  // console.dir({ filters, where }, { depth: 3 });

  const transactions = await db.expenseTransaction.findMany({
    orderBy: { date: "desc" },
    where: { ...where, userId: session.user.id },
    select: {
      id: true,
      amount: true,
      date: true,
      accountObj: { select: { id: true, name: true } },
    },
  });
  return transactions;
};

export const fetchTransactionStats = async ({
  filters,
}: {
  filters: ColumnFiltersState;
}) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const where = convertColumnFiltersToPrisma(filters, columns);
  // console.dir({ filters, where }, { depth: 3 });

  const transactions = await db.expenseTransaction.findMany({
    orderBy: { date: "asc" },
    where: { ...where, userId: session.user.id },
    select: {
      id: true,
      amount: true,
      date: true,
      tags: true,
      type: true,
      accountObj: { select: { id: true, name: true } },
    },
  });
  // return transactions;
  const byTag: IExpTransByAttrStats = {};
  const byAccount: IExpTransByAttrStats = {};
  const byType: IExpTransByAttrStats = {};

  transactions.forEach((t) => {
    t.tags?.forEach((tag) => {
      const tagKey = tag.replace(/\s+/g, "-").toLowerCase();
      if (!byTag[tagKey]) {
        byTag[tagKey] = [];
      }
      byTag[tagKey].push({
        date: t.date,
        account: t.accountObj.name,
        type: t.type,
        tag: tag,
        amount: t.amount,
      });
    });

    const accountKey = t.accountObj.name.replace(/\s+/g, "-").toLowerCase();
    if (!byAccount[accountKey]) {
      byAccount[accountKey] = [];
    }
    byAccount[accountKey].push({
      date: t.date,
      account: t.accountObj.name,
      type: t.type,
      tag: t.tags?.[0],
      amount: t.amount,
    });

    if (!byType[t.type]) {
      byType[t.type] = [];
    }
    byType[t.type].push({
      date: t.date,
      account: t.accountObj.name,
      type: t.type,
      tag: t.tags?.[0],
      amount: t.amount,
    });
  });

  const byTypeMonthly: IExpTransAmountByAttrStatsArray = {};
  const byAccountMonthly: IExpTransAmountByAttrStatsArray = {};
  const byTagMonthly: IExpTransAmountByAttrStatsArray = {};

  Object.entries(byType).forEach(([type, entries]) => {
    byTypeMonthly[type] = entries.reduce((acc: any, curr: any) => {
      const month = curr.date.getMonth() + 1;
      const year = curr.date.getFullYear();
      const day = curr.date.getDate();

      const keys = [
        `type-${type}`,
        `yearly-${year}`,
        `monthly-${month}-${year}`,
        `daily-${day}-${month}-${year}`,
      ];
      keys.forEach((key) => {
        if (acc[key]) {
          acc[key].amount += curr.amount;
        } else {
          acc[key] = {
            date: curr.date,
            type,
            amount: curr.amount,
          };
        }
      });
      return acc;
    }, {});
  });

  Object.entries(byAccount).forEach(([account, entries]) => {
    byAccountMonthly[account] = entries.reduce((acc: any, curr: any) => {
      const month = curr.date.getMonth() + 1;
      const year = curr.date.getFullYear();
      const day = curr.date.getDate();

      const keys = [
        `account-${account}`,
        `yearly-${year}`,
        `monthly-${month}-${year}`,
        `daily-${day}-${month}-${year}`,
      ];
      keys.forEach((key) => {
        if (acc[key]) {
          acc[key].amount += curr.amount;
        } else {
          acc[key] = {
            date: curr.date,
            account: curr.account,
            amount: curr.amount,
          };
        }
      });
      return acc;
    }, {});
  });

  Object.entries(byTag).forEach(([tag, entries]) => {
    byTagMonthly[tag] = entries.reduce((acc: any, curr: any) => {
      const month = curr.date.getMonth() + 1;
      const year = curr.date.getFullYear();
      const day = curr.date.getDate();

      const keys = [
        `tag-${tag}`,
        `yearly-${year}`,
        `monthly-${month}-${year}`,
        `daily-${day}-${month}-${year}`,
      ];
      keys.forEach((key) => {
        if (acc[key]) {
          acc[key].amount += curr.amount;
        } else {
          acc[key] = {
            date: curr.date,
            tag,
            amount: curr.amount,
          };
        }
      });
      return acc;
    }, {});
  });

  return {
    byType,
    byAccount,
    byTag,
    byTypeMonthly,
    byAccountMonthly,
    byTagMonthly,
  };
};
