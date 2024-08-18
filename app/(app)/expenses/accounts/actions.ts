"use server";

import { db } from "@/lib/db";
import { ExpenseAccount, Prisma } from "@prisma/client";

export const fetchTags = async () => {
  const tags = await db.expenseTags.findMany();
  return tags;
};

export const fetchAccounts = async () => {
  const accounts = await db.expenseAccount.findMany();
  return accounts;
};

export const getAccountDetails = async (id: ExpenseAccount["id"]) => {
  const dbAccount = await db.expenseAccount.findUnique({ where: { id } });
  if (!dbAccount) throw new Error("Account not found with " + id);
  return dbAccount;
};

export const updateAccount = async (
  id: ExpenseAccount["id"],
  data: Prisma.ExpenseAccountUpdateInput,
) => {
  const dbAccount = await db.expenseAccount.update({ data, where: { id } });
  if (!dbAccount) throw new Error("Account not found with " + id);
  return dbAccount;
};

export const createAccount = async (data: Prisma.ExpenseAccountCreateInput) => {
  const dbAccount = await db.expenseAccount.create({ data });
  if (!dbAccount) throw new Error("Account not created");
  return dbAccount;
};

export const deleteAccount = async (id: ExpenseAccount["id"]) => {
  const dbAccount = await db.expenseAccount.delete({ where: { id } });
  if (!dbAccount) throw new Error("Account not deleted");
  return dbAccount;
};
