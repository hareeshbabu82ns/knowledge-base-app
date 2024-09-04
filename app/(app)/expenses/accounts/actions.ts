"use server";
import { auth } from "@/lib/auth";
import config from "@/config/config";
import { db } from "@/lib/db";
import { ExpenseAccount, ExpenseTags, Prisma } from "@prisma/client";
import { join } from "path";
import { readFile } from "fs/promises";

///////////////////// Tags //////////////////////////
export const fetchTags = async () => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const tags = await db.expenseTags.findMany({
    where: { userId: session?.user?.id },
  });
  return tags;
};

export const createTag = async (data: Prisma.ExpenseTagsCreateInput) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const dbTag = await db.expenseTags.create({
    data: { ...data, user: { connect: { id: session?.user?.id } } },
  });
  if (!dbTag) throw new Error("Tag not created");
  return dbTag;
};

export const updateTag = async (
  id: ExpenseTags["id"],
  data: Prisma.ExpenseTagsUpdateInput,
) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const dbObj = await db.expenseTags.update({
    data,
    where: { id, userId: session?.user?.id },
  });
  if (!dbObj) throw new Error("Tag not found with " + id);
  return dbObj;
};

export const uploadTags = async (url: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const file = join(config.dataFolder, url);
  const data = await readFile(file, "utf-8");
  const jsonData = JSON.parse(data) as any;

  const accounts: Prisma.ExpenseTagsCreateManyInput[] = jsonData.map(
    (item: any) => {
      const { id, userId, ...rest } = item;
      return {
        ...rest,
        userId: session?.user?.id,
      } as Prisma.ExpenseTagsCreateManyInput;
    },
  );

  const res = await db.expenseTags.createMany({
    data: accounts,
  });

  return res;
};

export const deleteTag = async (id: ExpenseTags["id"]) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const dbTag = await db.expenseTags.delete({
    where: { id, userId: session?.user?.id },
  });
  if (!dbTag) throw new Error("Tag not deleted");
  return dbTag;
};

///////////////////// Accounts //////////////////////////
export const fetchAccounts = async () => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const accounts = await db.expenseAccount.findMany({
    where: { userId: session?.user?.id },
  });
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
  partialConfigFill = false,
) => {
  if (partialConfigFill) {
    const dbAccount = await db.expenseAccount.findUnique({ where: { id } });
    if (!dbAccount) throw new Error("Account not found with " + id);
    const config = (dbAccount.config as any) || {};
    data.config = { ...config, ...(data.config as any) };
  }
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const dbAccount = await db.expenseAccount.delete({
    where: { id, userId: session?.user?.id },
  });
  if (!dbAccount) throw new Error("Account not deleted");
  return dbAccount;
};

export const uploadAccounts = async (url: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");

  const file = join(config.dataFolder, url);
  const data = await readFile(file, "utf-8");
  const jsonData = JSON.parse(data) as any;

  const accounts: Prisma.ExpenseAccountCreateManyInput[] = jsonData.map(
    (item: any) => {
      return {
        ...item,
        id: item.id || item._id,
        // id: `${session?.user?.id}-${Buffer.from(item.name).toString("base64")}`,
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
