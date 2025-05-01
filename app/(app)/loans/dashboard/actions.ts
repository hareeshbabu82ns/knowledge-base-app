"use server";

import { db } from "@/lib/db";
import { Loan } from "@/app/generated/prisma";

export const getLoanDetailsWithSub = async (id: Loan["id"]) => {
  const dbLoan = await db.loan.findUnique({
    where: { id },
    include: { loanRates: true, loanExtraPayments: true },
  });
  if (!dbLoan) throw new Error("Loan not found with " + id);
  return dbLoan;
};
