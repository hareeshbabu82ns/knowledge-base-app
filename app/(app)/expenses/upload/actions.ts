"use server";

import { db } from "@/lib/db";
import { join } from "path";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { ExpenseAccount, Prisma } from "@prisma/client";
import config from "@/config/config";
import { IConfig } from "@/types/expenses";
import { ITransactionUploadRes } from "./types";
import {
  ignoreTransaction,
  prepareTransactionItem,
  preprocessTransactionLine,
} from "./utils";

export const uploadTransactions = async ({
  url,
  account,
  preview = false,
}: {
  url: string;
  account: ExpenseAccount;
  preview?: boolean;
}) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const file = join(config.dataFolder, url);
  const data = (await readFile(file, "utf-8")).split("\n");

  const dbAccount = await db.expenseAccount.findUnique({
    where: { id: account.id, userId: session.user.id },
  });
  if (!dbAccount) throw new Error("Account not found");

  const accConfig = dbAccount.config as unknown as IConfig;

  const headerLabels: string[] = [];
  const allRecords: Record<string, string>[] = [];
  const allTransactions: Prisma.ExpenseTransactionCreateManyInput[] = [];
  const finalTransactions: Prisma.ExpenseTransactionCreateManyInput[] = [];
  const ignoredTransactions: Prisma.ExpenseTransactionCreateManyInput[] = [];

  data.forEach((line, lineIdx) => {
    if (accConfig.headerLines === 0 && lineIdx === 0) {
      headerLabels.push(
        ...line.split(accConfig.separator).map((_, idx) => `Column-${idx + 1}`),
      );
    } else if (lineIdx < accConfig.headerLines) {
      return;
    }

    const item = preprocessTransactionLine({
      line,
      lineIdx,
      accConfig,
    });
    // console.log(item);
    if (!item) return;

    allRecords.push(item);

    const transaction = prepareTransactionItem(
      item,
      dbAccount,
      session?.user?.id,
      line,
    );
    allTransactions.push(transaction);

    if (ignoreTransaction(transaction, accConfig)) {
      ignoredTransactions.push(transaction);
    } else {
      finalTransactions.push(transaction);
    }
  });

  if (!preview) {
    await db.expenseTransaction.createMany({
      data: finalTransactions,
    });
    await db.expenseIgnoredTransaction.createMany({
      data: ignoredTransactions,
    });
  }

  return {
    headerLabels,
    allRecords,
    allTransactions,
    finalTransactions,
    ignoredTransactions,
  } as ITransactionUploadRes;
};
