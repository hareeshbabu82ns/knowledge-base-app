import { PrismaClient } from "@/app/generated/prisma";

declare const global: {
  // eslint-disable-next-line no-var
  db: PrismaClient | undefined;
};

export const db: PrismaClient =
  global.db ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.db = db;
