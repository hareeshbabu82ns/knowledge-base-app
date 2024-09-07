import { trimNewLineChar, trimQuotes } from "@/lib/utils";
import { IConfig } from "@/types/expenses";
import { ExpenseAccount, Prisma } from "@prisma/client";
import { parse } from "date-fns";

export const preprocessTransactionLine = ({
  line,
  accConfig,
}: {
  line: string;
  accConfig: IConfig;
}) => {
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
  const lineSplits: string[] = trimNewLineChar(lineScoped).split(
    accConfig.separator,
  );

  const item = lineSplits.reduce(
    (acc, value, idx) => {
      acc[accConfig.fileFields[idx].name] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
  return item;
};

export function prepareTransactionItem(
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
    const value: string = accConfig.trimQuotes
      ? trimQuotes(from[fieldConfig.name])
      : from[fieldConfig.name];

    if (!value) {
      return;
    }

    switch (fieldConfig.expenseColumn) {
      case "date":
        const timeStr =
          fieldConfig.timeColumnIndex > 0
            ? from[accConfig.fileFields[fieldConfig.timeColumnIndex - 1].name]
            : "";
        const timeStrUnquoted = accConfig.trimQuotes
          ? trimQuotes(timeStr)
          : timeStr;
        const dateValue = `${value} ${timeStrUnquoted}`;
        item.date = parse(dateValue, fieldConfig.format, new Date());
        break;
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

export function pepareTransactionTags(
  from: Prisma.ExpenseTransactionCreateManyInput,
  config: IConfig,
) {
  const tags = new Set<string>();

  if (!config.tagOps) {
    return [from.type === "Expense" ? "Untagged_Expense" : "Untagged_Income"];
  }

  for (const tagOp of config.tagOps) {
    const tagFieldName =
      tagOp.name as keyof Prisma.ExpenseTransactionCreateManyInput;
    switch (tagOp.comparision) {
      case "EQ":
        if (from[tagFieldName] === tagOp.value) {
          tagOp.tags.forEach((t) => tags.add(t));
        }
        break;
      case "NE":
        if (from[tagFieldName] !== tagOp.value) {
          tagOp.tags.forEach((t) => tags.add(t));
        }
        break;
      case "GT":
        if ((from[tagFieldName] as number) > Number(tagOp.value)) {
          tagOp.tags.forEach((t) => tags.add(t));
        }
        break;
      case "LT":
        if ((from[tagFieldName] as number) < Number(tagOp.value)) {
          tagOp.tags.forEach((t) => tags.add(t));
        }
        break;
      case "CONTAINS":
        if ((from[tagFieldName] as string).includes(tagOp.value)) {
          tagOp.tags.forEach((t) => tags.add(t));
        }
        break;
      case "REGEX":
        if (new RegExp(tagOp.value).test(from[tagFieldName] as string)) {
          tagOp.tags.forEach((t) => tags.add(t));
        }
        break;
      case "STARTS_WITH":
        if ((from[tagFieldName] as string).startsWith(tagOp.value)) {
          tagOp.tags.forEach((t) => tags.add(t));
        }
        break;
    }
  }

  if (tags.size === 0) {
    tags.add(from.type === "Expense" ? "Untagged_Expense" : "Untagged_Income");
  } else {
    tags.delete("Untagged_Expense");
    tags.delete("Untagged_Income");
  }
  return Array.from(tags).sort();
}

export function ignoreTransaction(
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
