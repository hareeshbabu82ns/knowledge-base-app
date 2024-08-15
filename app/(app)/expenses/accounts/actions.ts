"use server";

import { db } from "@/lib/db";

export const fetchAccounts = async () => {
  const accounts = await db.expenseAccount.findMany();
  return accounts;
};

export const getAccountDetails = async (id: string) => {
  const dbAccount = await db.expenseAccount.findUnique({ where: { id } });
  if (!dbAccount) throw new Error("Account not found with " + id);
  return dbAccount;
};
