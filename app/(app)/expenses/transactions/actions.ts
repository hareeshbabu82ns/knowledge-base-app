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
  IConfig,
  IExpTransAmountByAttrStatsArray,
  IExpTransByAttrStats,
} from "@/types/expenses";
import { ExpenseTransaction, Prisma } from "@/app/generated/prisma";
import {
  ignoreTransaction,
  prepareTransactionItem,
  preprocessTransactionLine,
} from "../upload/utils";

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

  const expenseTransactionCount = await db.expenseTransaction.count({
    where: { ...where, userId: session.user.id },
  });

  const transactions = await db.expenseTransaction.findMany({
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: sorting?.length ? (orderBy as any) : { id: "desc" },
    where: { ...where, userId: session.user.id },
    include: { accountObj: true },
  });
  return { rowCount: expenseTransactionCount, rows: transactions };
};

export const reprocessDBTransactions = async ({
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
    where: { ...where, userId: session.user.id },
    include: { accountObj: true },
  });

  const finalTransactions: ExpenseTransaction[] = [];
  const ignoredTransactions: ExpenseTransaction[] = [];

  transactions.forEach((dbTrans, lineIdx) => {
    const accConfig = dbTrans.accountObj.config as any as IConfig;
    if (dbTrans.sourceLine?.length === 0) {
      // no sourceLine, probably manually added, process using db values
      const { id, accountObj, sourceLine, ...dbTransRest } = dbTrans;
      if (ignoreTransaction(dbTransRest, accConfig)) {
        ignoredTransactions.push({
          ...(dbTransRest as any),
          id: dbTrans.id,
        });
      } else {
        if (
          dbTrans.amount !== dbTransRest.amount ||
          dbTrans.date.toString() !== dbTransRest.date.toString() ||
          dbTrans.description !== dbTransRest.description ||
          !(dbTransRest.tags as string[])?.every((tag) =>
            dbTrans.tags.includes(tag),
          )
        ) {
          finalTransactions.push({
            ...(dbTransRest as any),
            id: dbTrans.id,
          });
        }
      }
    } else {
      // uploaded by file, reprocess using the sourceLine
      const item = preprocessTransactionLine({
        line: dbTrans.sourceLine || "",
        lineIdx,
        accConfig,
      });
      if (!item) return;

      const lineSplitsLength = Object.keys(item).length;

      if (lineSplitsLength !== accConfig.fileFields.length) {
        throw new Error(
          `Line: ${dbTrans.sourceLine} \n\t- Columns: ${lineSplitsLength} - Header Columns: ${accConfig.fileFields.length} mismatch`,
        );
      }
      // console.dir({ accConfig, item }, { depth: 3 });
      const transaction = prepareTransactionItem(
        item,
        dbTrans.accountObj,
        session?.user?.id,
        dbTrans.sourceLine || "",
      );
      // console.dir(transaction, { depth: 3 });

      if (ignoreTransaction(transaction, accConfig)) {
        ignoredTransactions.push({
          ...(transaction as any),
          id: dbTrans.id,
        });
      } else {
        if (
          dbTrans.amount !== transaction.amount ||
          dbTrans.date.toString() !== transaction.date?.toString() ||
          dbTrans.description !== transaction.description ||
          !(transaction.tags as string[])?.every((tag) =>
            dbTrans.tags.includes(tag),
          )
        ) {
          finalTransactions.push({
            ...(transaction as any),
            id: dbTrans.id,
          });
        }
      }
    }
  });

  for (const t of finalTransactions) {
    const { id, userId, account, sourceLine, ...dbTransaction } = t;
    await db.expenseTransaction.update({
      data: dbTransaction,
      where: { id },
    });
  }

  // delete ignored transactions
  // console.log("ignoredTransactions", ignoredTransactions);
  const ids = ignoredTransactions.map((t) => t.id!);
  if (ids && ids.length > 0) {
    await db.expenseTransaction.deleteMany({
      where: { id: { in: ids } },
    });
  }
  // move to ignored transactions
  for (const t of ignoredTransactions) {
    const { id, ...dbTransaction } = t;
    await db.expenseIgnoredTransaction.createMany({
      data: dbTransaction,
    });
  }

  return {
    rowCount: finalTransactions.length,
    rowCountIgnored: ignoredTransactions.length,
  };
};

export const createExpenseTransaction = async (
  data: Prisma.ExpenseTransactionCreateInput,
) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const dbExpenseTransaction = await db.expenseTransaction.create({
    data: { ...data, user: { connect: { id: session?.user?.id } } },
  });
  if (!dbExpenseTransaction)
    throw new Error("Unable to create ExpenseTransaction");
  return dbExpenseTransaction;
};

export const updateExpenseTransaction = async (
  id: ExpenseTransaction["id"],
  data: Prisma.ExpenseTransactionUpdateInput,
) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const dbObj = await db.expenseTransaction.update({
    data,
    where: { id, userId: session?.user?.id },
  });
  if (!dbObj) throw new Error("ExpenseTransaction not found with " + id);
  return dbObj;
};

export const deleteExpenseTransaction = async (
  id: ExpenseTransaction["id"],
) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const dbTransaction = await db.expenseTransaction.delete({
    where: { id, userId: session?.user?.id },
  });
  if (!dbTransaction) throw new Error("unable to delete Transaction");
  return dbTransaction;
};

export const splitExpenseTransaction = async ({
  id,
  splits,
}: {
  id: ExpenseTransaction["id"];
  splits: { amount: number; description?: string }[];
}) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  return await db.$transaction(async (tx) => {
    const dbTransaction = await tx.expenseTransaction.findUnique({
      where: { id },
    });
    if (!dbTransaction) throw new Error("unable to find Transaction");

    for (const split of splits) {
      const dbSplit = await tx.expenseTransaction.create({
        data: {
          ...dbTransaction,
          amount: split.amount,
          description: split.description || dbTransaction.description,
          sourceLine: "", // clear sourceLine to indicate manual split
          id: undefined,
        },
      });
      if (!dbSplit) throw new Error("unable to split Transaction");
    }

    const dbIgnoredTransaction = await tx.expenseIgnoredTransaction.create({
      data: dbTransaction,
    });
    if (!dbIgnoredTransaction) throw new Error("unable to ignore Transaction");

    const res = await tx.expenseTransaction.delete({ where: { id } });
    if (!res) throw new Error("unable to delete source Transaction");

    return dbIgnoredTransaction;
  });
};

export const ignoreExpenseTransaction = async (
  id: ExpenseTransaction["id"],
) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  return await db.$transaction(async (tx) => {
    const dbTransaction = await tx.expenseTransaction.findUnique({
      where: { id },
    });
    if (!dbTransaction) throw new Error("unable to find Transaction");

    const dbIgnoredTransaction = await tx.expenseIgnoredTransaction.create({
      data: dbTransaction,
    });
    if (!dbIgnoredTransaction) throw new Error("unable to ignore Transaction");

    const res = await tx.expenseTransaction.delete({ where: { id } });
    if (!res) throw new Error("unable to delete source Transaction");

    return dbIgnoredTransaction;
  });
};

//////////////Charts////////////////////////////////

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
    orderBy: [{ date: "asc" }, { amount: "asc" }],
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

  const tagFilter = (
    filters.find((c) => c.id === "tags") || { id: "tags", value: [] }
  ).value as string[];

  transactions.forEach((t) => {
    t.tags?.forEach((tag) => {
      if (tagFilter.length === 0 && !ImpTags.includes(tag)) return;
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
const ImpTags = [
  // "Income",
  "Food",
  "Utilities",
  "Housing",
  "Transportation",
  "Cornerstone House",
  "Healthcare",
  "Personal Care",
  "Entertainment",
  "Untagged_Expense",
  "Untagged_Income",
];
const TopLevelTags = [
  "Income",
  "Housing",
  "Utilities",
  "Food",
  "Transportation",
  "Healthcare",
  "Personal Care",
  "Entertainment",
  "Education",
  "Miscellaneous",
  "Maintenance",
  "Fee",
  "Others",
];
