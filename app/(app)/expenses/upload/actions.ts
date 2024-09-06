"use server";

import { db } from "@/lib/db";
import { join } from "path";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { ExpenseAccount, Prisma } from "@prisma/client";
import config from "@/config/config";
import { IConfig } from "@/types/expenses";
import { parse } from "date-fns";
import { ITransactionUploadRes } from "./types";

function pepareTransactionTags(
  from: Prisma.ExpenseTransactionCreateManyInput,
  config: IConfig,
) {
  const tags: string[] = [];

  if (!config.tagOps) {
    return [from.type === "Expense" ? "Untagged_Expense" : "Untagged_Income"];
  }

  for (const tagOp of config.tagOps) {
    const tagFieldName =
      tagOp.name as keyof Prisma.ExpenseTransactionCreateManyInput;
    switch (tagOp.comparision) {
      case "EQ":
        if (from[tagFieldName] === tagOp.value) {
          tags.push(...tagOp.tags);
        }
        break;
      case "NE":
        if (from[tagFieldName] !== tagOp.value) {
          tags.push(...tagOp.tags);
        }
        break;
      case "GT":
        if ((from[tagFieldName] as number) > Number(tagOp.value)) {
          tags.push(...tagOp.tags);
        }
        break;
      case "LT":
        if ((from[tagFieldName] as number) < Number(tagOp.value)) {
          tags.push(...tagOp.tags);
        }
        break;
      case "CONTAINS":
        if ((from[tagFieldName] as string).includes(tagOp.value)) {
          tags.push(...tagOp.tags);
        }
        break;
      case "REGEX":
        if (new RegExp(tagOp.value).test(from[tagFieldName] as string)) {
          tags.push(...tagOp.tags);
        }
        break;
      case "STARTS_WITH":
        if ((from[tagFieldName] as string).startsWith(tagOp.value)) {
          tags.push(...tagOp.tags);
        }
        break;
    }
  }

  if (tags.length === 0) {
    tags.push(from.type === "Expense" ? "Untagged_Expense" : "Untagged_Income");
    return tags;
  } else {
    const finalTags = tags.filter(
      (tag) => ["Untagged_Expense", "Untagged_Income"].indexOf(tag) === -1,
    );
    return finalTags;
  }
}

function ignoreTransaction(
  from: Prisma.ExpenseTransactionCreateManyInput,
  config: IConfig,
) {
  if (!config.ignoreOps) {
    return false;
  }
  for (const ignoreOp of config.ignoreOps) {
    const ignoreFieldName =
      ignoreOp.name as keyof Prisma.ExpenseTransactionCreateManyInput;
    const strValue = from[ignoreFieldName] as string;
    switch (ignoreOp.comparision) {
      case "EQ":
        if (from[ignoreFieldName] === ignoreOp.value) {
          return true;
        }
        break;
      case "CONTAINS":
        if (strValue.includes(ignoreOp.value)) {
          return true;
        }
        break;
      case "STARTS_WITH":
        if (strValue.startsWith(ignoreOp.value)) {
          return true;
        }
        break;
      case "REGEX":
        if (new RegExp(ignoreOp.value).test(strValue)) {
          return true;
        }
        break;
      case "ENDS_WITH":
        if (strValue.endsWith(ignoreOp.value)) {
          return true;
        }
        break;
      case "NOT_CONTAINS":
        if (!strValue.includes(ignoreOp.value)) {
          return true;
        }
        break;
      case "NOT_STARTS_WITH":
        if (!strValue.startsWith(ignoreOp.value)) {
          return true;
        }
        break;
      case "NOT_ENDS_WITH":
        if (!strValue.endsWith(ignoreOp.value)) {
          return true;
        }
        break;
      case "NE":
        if (from[ignoreFieldName] !== ignoreOp.value) {
          return true;
        }
        break;
      case "GT":
        if ((from[ignoreFieldName] as number) > Number(ignoreOp.value)) {
          return true;
        }
        break;
      case "LT":
        if ((from[ignoreFieldName] as number) < Number(ignoreOp.value)) {
          return true;
        }
        break;
      case "GE":
        if ((from[ignoreFieldName] as number) >= Number(ignoreOp.value)) {
          return true;
        }
        break;
      case "LE":
        if ((from[ignoreFieldName] as number) <= Number(ignoreOp.value)) {
          return true;
        }
        break;
    }
  }
  return false;
}

function prepareTransactionItem(
  from: Record<string, string>,
  account: ExpenseAccount,
  userId: string,
  sourceLine?: string,
): Prisma.ExpenseTransactionCreateManyInput {
  const item: Prisma.ExpenseTransactionCreateManyInput = {
    userId,
    account: account.id,
    sourceLine,
  };

  const accConfig = account.config as unknown as IConfig;

  accConfig.fileFields.forEach((fieldConfig, idx) => {
    const value: string = from[fieldConfig.name];
    if (!value) {
      return;
    }
    switch (fieldConfig.expenseColumn) {
      case "date":
        item.date = parse(value, fieldConfig.format, new Date());
        if (fieldConfig.timeColumnIndex > 0) {
          const timeValue =
            from[accConfig.fileFields[fieldConfig.timeColumnIndex].name];
          item.date.setHours(
            Number(timeValue.split(":")[0]),
            Number(timeValue.split(":")[1]),
          );
        }
        break;
      // case "description":
      //   item.description = value;
      //   break;
      case "amount":
        const amtNum = Number(value);
        const amtVal = isNaN(amtNum) ? 0.0 : amtNum;
        switch (fieldConfig.expenseType) {
          case "EXPENSE_IF_GT_0":
            if (amtVal > 0.0) {
              item.type = "Expense";
            }
            break;
          case "EXPENSE_IF_GT_0_EL_INCOME":
            if (amtVal > 0.0) {
              item.type = "Expense";
            } else {
              item.type = "Income";
            }
            break;
          case "INCOME_IF_GT_0":
            if (amtVal > 0.0) {
              item.type = "Income";
            }
            break;
          case "INCOME_IF_GT_0_EL_EXPENSE":
            if (amtVal > 0.0) {
              item.type = "Income";
            } else {
              item.type = "Expense";
            }
            break;
          default:
            item.type = "Expense";
        }
        item.amount = amtVal * (fieldConfig.negated ? -1 : 1);
        break;
      default:
        if (fieldConfig.expenseColumn !== "none" && !fieldConfig.ignore) {
          item[
            fieldConfig.expenseColumn as keyof Prisma.ExpenseTransactionCreateManyInput
          ] = value as never;
        }
    }
  });
  item.tags = pepareTransactionTags(item, accConfig);
  return item;
}
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
    // empty line
    if (!line.trim()) {
      return;
    }
    // line scope replacements
    const lineScoped =
      accConfig?.textToAdjust?.reduce((acc, conf) => {
        if (conf.scope === "line") {
          return acc.replace(conf.source, conf.replaceWith);
        }
        return acc;
      }, line) || line;
    const lineSplits = lineScoped.split(accConfig.separator);

    if (accConfig.headerLines === 0 && lineIdx === 0) {
      headerLabels.push(...lineSplits.map((_, idx) => `Column-${idx + 1}`));
    } else if (lineIdx < accConfig.headerLines) {
      headerLabels.push(...lineSplits);
      return;
    }

    if (lineSplits.length !== accConfig.fileFields.length) {
      throw new Error(
        `Line(${lineIdx}): ${line} \n\t- Columns: ${lineSplits.length} - Header Columns: ${headerLabels.length} mismatch`,
      );
    }

    const item = lineSplits.reduce(
      (acc, value, idx) => {
        acc[accConfig.fileFields[idx].name] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
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
