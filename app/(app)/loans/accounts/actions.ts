"use server";

import { Option } from "@/components/ui/multi-select";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Loan, LoanExtraPayments, LoanRates, Prisma } from "@prisma/client";
import { connect } from "http2";

// Loans
export const fetchLoansDDLB = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const loans = await db.loan.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });
  return loans.map((loan) => ({ value: loan.id, label: loan.name }) as Option);
};

export const fetchLoans = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const loans = await db.loan.findMany({
    where: { userId: session.user.id },
    include: { loanRates: true, loanExtraPayments: true },
  });
  return loans;
};

export const getLoanDetails = async (id: Loan["id"]) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const dbLoan = await db.loan.findUnique({
    where: { id, userId: session.user.id },
  });
  if (!dbLoan) throw new Error("Loan not found with " + id);
  return dbLoan;
};

export const updateLoan = async (
  id: Loan["id"],
  data: Prisma.LoanUpdateInput,
) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const dbLoan = await db.loan.update({ data, where: { id } });
  if (!dbLoan) throw new Error("Loan not found with " + id);
  return dbLoan;
};

export const createLoan = async (data: Prisma.LoanCreateInput) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const dbLoan = await db.loan.create({
    data: { ...data, user: { connect: { id: session.user.id } } },
  });
  if (!dbLoan) throw new Error("Loan not created");
  return dbLoan;
};

export const deleteLoan = async (id: Loan["id"]) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const dbLoan = await db.loan.delete({
    where: { id, userId: session.user.id },
  });
  if (!dbLoan) throw new Error("Loan not deleted");
  return dbLoan;
};

// LoanExtraPayments
export const fetchLoanExtraPayments = async (loanId: string) => {
  const extraPayments = await db.loanExtraPayments.findMany({
    where: { loanId },
  });
  return extraPayments;
};

export const getLoanExtraPaymentsDetails = async (
  id: LoanExtraPayments["id"],
) => {
  const dbLoanExtraPayments = await db.loanExtraPayments.findUnique({
    where: { id },
  });
  if (!dbLoanExtraPayments)
    throw new Error("LoanExtraPayments not found with " + id);
  return dbLoanExtraPayments;
};

export const updateLoanExtraPayments = async (
  id: LoanExtraPayments["id"],
  data: Prisma.LoanExtraPaymentsUpdateInput,
) => {
  const dbLoanExtraPayments = await db.loanExtraPayments.update({
    data,
    where: { id },
  });
  if (!dbLoanExtraPayments)
    throw new Error("LoanExtraPayments not found with " + id);
  return dbLoanExtraPayments;
};

export const createLoanExtraPayments = async (
  data: Prisma.LoanExtraPaymentsCreateInput,
) => {
  const dbLoanExtraPayments = await db.loanExtraPayments.create({ data });
  if (!dbLoanExtraPayments) throw new Error("LoanExtraPayments not created");
  return dbLoanExtraPayments;
};

export const deleteLoanExtraPayments = async (id: LoanExtraPayments["id"]) => {
  const dbLoanExtraPayments = await db.loanExtraPayments.delete({
    where: { id },
  });
  if (!dbLoanExtraPayments) throw new Error("LoanExtraPayments not deleted");
  return dbLoanExtraPayments;
};

// LoanRates
export const fetchLoanRates = async (loanId: string) => {
  const rates = await db.loanRates.findMany({ where: { loanId } });
  return rates;
};

export const getLoanRatesDetails = async (id: LoanRates["id"]) => {
  const dbLoanRates = await db.loanRates.findUnique({ where: { id } });
  if (!dbLoanRates) throw new Error("LoanRates not found with " + id);
  return dbLoanRates;
};

export const updateLoanRates = async (
  id: LoanRates["id"],
  data: Prisma.LoanRatesUpdateInput,
) => {
  const dbLoanRates = await db.loanRates.update({ data, where: { id } });
  if (!dbLoanRates) throw new Error("LoanRates not found with " + id);
  return dbLoanRates;
};

export const createLoanRates = async (data: Prisma.LoanRatesCreateInput) => {
  const dbLoanRates = await db.loanRates.create({ data });
  if (!dbLoanRates) throw new Error("LoanRates not created");
  return dbLoanRates;
};

export const deleteLoanRates = async (id: LoanRates["id"]) => {
  const dbLoanRates = await db.loanRates.delete({ where: { id } });
  if (!dbLoanRates) throw new Error("LoanRates not deleted");
  return dbLoanRates;
};
