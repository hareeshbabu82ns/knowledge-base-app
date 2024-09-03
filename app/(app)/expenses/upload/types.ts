import { Prisma } from "@prisma/client";

export interface ITransactionUploadRes {
  headerLabels: string[];
  allRecords: Record<string, string>[];
  allTransactions: Prisma.ExpenseTransactionCreateManyInput[];
  finalTransactions: Prisma.ExpenseTransactionCreateManyInput[];
  ignoredTransactions: Prisma.ExpenseTransactionCreateManyInput[];
}
