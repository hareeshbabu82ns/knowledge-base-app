"use server";
import { auth } from "@/lib/auth";
import config from "@/config/config";
import { db } from "@/lib/db";
import { ExpenseAccount, Prisma } from "@prisma/client";
import { join } from "path";
import { readFile } from "fs/promises";

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

export const uploadAccounts = async (url: string) => {
  const session = await auth();

  const file = join(config.dataFolder, url);
  const data = await readFile(file, "utf-8");
  const jsonData = JSON.parse(data) as any;

  const accounts: Prisma.ExpenseAccountCreateManyInput[] = jsonData.map(
    (item: any) => {
      return {
        ...item,
        id: item.id || item._id,
        _id: undefined,
        __v: undefined,
        userId: session?.user?.id,
      } as Prisma.ExpenseAccountCreateManyInput;
    },
  );

  const res = await db.expenseAccount.createMany({
    data: accounts,
  });

  return res;
};
