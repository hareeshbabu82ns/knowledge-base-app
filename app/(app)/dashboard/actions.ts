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
  income: {
    totalAmount: number;
    transactionCount: number;
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
    expenses: number;
    income: number;
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
  expensesByTag: {
    tag: string;
    averageAmount: number;
    totalAmount: number;
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
  const sixMonthsAgo = subMonths(now, 6);

  // First, get all transactions grouped by month to find the last month with data
  const monthlyTransactionsRaw = await db.expenseTransaction.groupBy({
    by: ["date", "type"],
    where: {
      userId,
      date: { gte: sixMonthsAgo },
    },
    _sum: { amount: true },
    _count: true,
    orderBy: {
      date: "desc",
    },
  });

  // Group by month to find which months have data
  const monthsWithData = new Map<string, Date>();
  monthlyTransactionsRaw.forEach((item) => {
    const monthStart = startOfMonth(new Date(item.date));
    const monthKey = monthStart.toISOString();
    if (!monthsWithData.has(monthKey)) {
      monthsWithData.set(monthKey, monthStart);
    }
  });

  // Sort months and get the two most recent months with data
  const sortedMonths = Array.from(monthsWithData.values()).sort(
    (a, b) => b.getTime() - a.getTime(),
  );

  // Use the most recent month with data as "current" and the one before as "last"
  const currentMonthStart =
    sortedMonths.length > 0 ? sortedMonths[0] : startOfMonth(now);
  const currentMonthEnd = endOfMonth(currentMonthStart);
  const lastMonthStart =
    sortedMonths.length > 1 ? sortedMonths[1] : startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(lastMonthStart);

  // Fetch expense stats
  const [
    currentMonthExpenses,
    currentMonthIncome,
    lastMonthExpenses,
    lastMonthIncome,
    expenseAccounts,
    recentTransactions,
    monthlyTransactions,
    expensesByType,
    expensesByAccount,
    expenseAccountsList,
    expenseTransactionsWithTags,
  ] = await Promise.all([
    // Current month expense transactions
    db.expenseTransaction.aggregate({
      where: {
        userId,
        type: "Expense",
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Current month income transactions
    db.expenseTransaction.aggregate({
      where: {
        userId,
        type: "Income",
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Last month expense transactions
    db.expenseTransaction.aggregate({
      where: {
        userId,
        type: "Expense",
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Last month income transactions
    db.expenseTransaction.aggregate({
      where: {
        userId,
        type: "Income",
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
      _count: true,
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
        accountObj: {
          select: { name: true },
        },
      },
    }),
    // Monthly transactions for last 6 months (grouped by date and type)
    db.expenseTransaction.groupBy({
      by: ["date", "type"],
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Expenses by type (only expenses, not income)
    db.expenseTransaction.groupBy({
      by: ["type"],
      where: {
        userId,
        type: "Expense",
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Expenses by account (only expenses, not income)
    db.expenseTransaction.groupBy({
      by: ["account"],
      where: {
        userId,
        type: "Expense",
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Expense accounts (for mapping)
    db.expenseAccount.findMany({
      where: {
        userId,
      },
    }),
    // All expense transactions with tags for the last 6 months
    db.expenseTransaction.findMany({
      where: {
        userId,
        type: "Expense",
        date: { gte: sixMonthsAgo },
      },
      select: {
        tags: true,
        amount: true,
      },
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

  // Calculate monthly change percentage for expenses
  const currentExpenseTotal = currentMonthExpenses._sum.amount || 0;
  const lastExpenseTotal = lastMonthExpenses._sum.amount || 0;
  const expenseMonthlyChange =
    lastExpenseTotal > 0
      ? ((currentExpenseTotal - lastExpenseTotal) / lastExpenseTotal) * 100
      : 0;

  // Calculate monthly change percentage for income
  const currentIncomeTotal = currentMonthIncome._sum.amount || 0;
  const lastIncomeTotal = lastMonthIncome._sum.amount || 0;
  const incomeMonthlyChange =
    lastIncomeTotal > 0
      ? ((currentIncomeTotal - lastIncomeTotal) / lastIncomeTotal) * 100
      : 0;

  // Process monthly transactions data (separate income and expenses)
  const monthlyDataMap = new Map<
    string,
    { expenses: number; income: number }
  >();
  monthlyTransactions.forEach((item) => {
    const monthKey = new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const currentData = monthlyDataMap.get(monthKey) || {
      expenses: 0,
      income: 0,
    };

    if (item.type === "Expense") {
      currentData.expenses += item._sum.amount || 0;
    } else if (item.type === "Income") {
      currentData.income += item._sum.amount || 0;
    }

    monthlyDataMap.set(monthKey, currentData);
  });

  const monthlyExpensesArray = Array.from(monthlyDataMap.entries())
    .map(([month, data]) => ({
      month,
      expenses: data.expenses,
      income: data.income,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Process expenses by tag - calculate average expenses per tag
  const tagDataMap = new Map<string, { total: number; count: number }>();
  expenseTransactionsWithTags.forEach((transaction) => {
    if (transaction.tags && transaction.tags.length > 0) {
      transaction.tags.forEach((tag) => {
        const currentData = tagDataMap.get(tag) || { total: 0, count: 0 };
        currentData.total += transaction.amount;
        currentData.count += 1;
        tagDataMap.set(tag, currentData);
      });
    }
  });

  const ImpTags = [
    // "Income",
    // "Food",
    "Groceries",
    "DineOut",
    "Coffee/Snacks",
    "Utilities",
    "Transportation",
    "Cornerstone House",
    "Healthcare",
    "Personal Care",
    "Entertainment",
    "Subscriptions",
    "Online Shopping",
    // "Untagged_Expense",
    // "Untagged_Income",
  ];

  const expensesByTagArray = Array.from(tagDataMap.entries())
    .map(([tag, data]) => ({
      tag,
      averageAmount: data.count > 0 ? data.total / 6 : 0,
      totalAmount: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.averageAmount - a.averageAmount)
    .filter((item) => ImpTags.includes(item.tag));
  // .slice(0, 10); // Limit to top 10 tags by average

  return {
    expenses: {
      totalAmount: currentExpenseTotal,
      transactionCount: currentMonthExpenses._count || 0,
      accountCount: expenseAccounts,
      monthlyChange: expenseMonthlyChange,
    },
    income: {
      totalAmount: currentIncomeTotal,
      transactionCount: currentMonthIncome._count || 0,
      monthlyChange: incomeMonthlyChange,
    },
    loans: {
      totalAmount: loans.reduce((sum, loan) => sum + loan.amount, 0),
      loanCount: loans.length,
      totalEMI: loans.reduce((sum, loan) => sum + loan.emi, 0),
      activeLoanCount,
    },
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      account: t.accountObj?.name || t.account || "N/A",
    })),
    monthlyExpenses: monthlyExpensesArray,
    expensesByType: expensesByType.map((item) => ({
      type: item.type,
      amount: item._sum.amount || 0,
      count: item._count,
    })),
    expensesByAccount: expensesByAccount.map((item) => ({
      account:
        expenseAccountsList.find((acc) => acc.id === item.account)?.name ||
        item.account ||
        "N/A",
      amount: item._sum.amount || 0,
      count: item._count,
    })),
    expensesByTag: expensesByTagArray,
  };
}
