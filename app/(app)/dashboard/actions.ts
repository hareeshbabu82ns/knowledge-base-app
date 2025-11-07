"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export type DashboardStats = {
  expenses: {
    totalAmount: number;
    transactionCount: number;
    accountCount: number;
    monthlyChange: number;
  };
  loans: {
    totalAmount: number;
    loanCount: number;
    totalEMI: number;
    activeLoanCount: number;
  };
  recentTransactions: {
    id: string;
    amount: number;
    description: string;
    date: Date;
    type: string;
    account: string;
  }[];
  monthlyExpenses: {
    month: string;
    amount: number;
  }[];
  expensesByType: {
    type: string;
    amount: number;
    count: number;
  }[];
  expensesByAccount: {
    account: string;
    amount: number;
    count: number;
  }[];
};

export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const sixMonthsAgo = subMonths(now, 6);

  // Fetch expense stats
  const [
    currentMonthTransactions,
    lastMonthTransactions,
    expenseAccounts,
    recentTransactions,
    monthlyExpenses,
    expensesByType,
    expensesByAccount,
  ] = await Promise.all([
    // Current month transactions
    db.expenseTransaction.aggregate({
      where: {
        userId,
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Last month transactions
    db.expenseTransaction.aggregate({
      where: {
        userId,
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
    }),
    // Expense accounts count
    db.expenseAccount.count({
      where: { userId },
    }),
    // Recent transactions
    db.expenseTransaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        description: true,
        date: true,
        type: true,
        account: true,
      },
    }),
    // Monthly expenses for last 6 months
    db.expenseTransaction.groupBy({
      by: ["date"],
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
    }),
    // Expenses by type
    db.expenseTransaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Expenses by account
    db.expenseTransaction.groupBy({
      by: ["account"],
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // Fetch loan stats
  const [loans, activeLoanCount] = await Promise.all([
    db.loan.findMany({
      where: { userId },
      select: {
        amount: true,
        emi: true,
      },
    }),
    db.loan.count({
      where: {
        userId,
        startDate: { lte: now },
      },
    }),
  ]);

  // Calculate monthly change percentage
  const currentTotal = currentMonthTransactions._sum.amount || 0;
  const lastTotal = lastMonthTransactions._sum.amount || 0;
  const monthlyChange =
    lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

  // Process monthly expenses data
  const monthlyExpensesMap = new Map<string, number>();
  monthlyExpenses.forEach((item) => {
    const monthKey = new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const currentAmount = monthlyExpensesMap.get(monthKey) || 0;
    monthlyExpensesMap.set(monthKey, currentAmount + (item._sum.amount || 0));
  });

  const monthlyExpensesArray = Array.from(monthlyExpensesMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  return {
    expenses: {
      totalAmount: currentTotal,
      transactionCount: currentMonthTransactions._count || 0,
      accountCount: expenseAccounts,
      monthlyChange,
    },
    loans: {
      totalAmount: loans.reduce((sum, loan) => sum + loan.amount, 0),
      loanCount: loans.length,
      totalEMI: loans.reduce((sum, loan) => sum + loan.emi, 0),
      activeLoanCount,
    },
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      account: t.account || "N/A",
    })),
    monthlyExpenses: monthlyExpensesArray,
    expensesByType: expensesByType.map((item) => ({
      type: item.type,
      amount: item._sum.amount || 0,
      count: item._count,
    })),
    expensesByAccount: expensesByAccount.map((item) => ({
      account: item.account,
      amount: item._sum.amount || 0,
      count: item._count,
    })),
  };
}
