"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "./actions";
import Loader from "@/components/shared/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const pieChartConfig = {
  amount: {
    label: "Amount",
  },
} satisfies ChartConfig;

const Page = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!stats) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to HKBase</CardTitle>
            <CardDescription>
              Please sign in to view your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in to access your financial data, manage expenses, track
                loans, and view detailed analytics.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="/sign-in"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Sign In
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalExpensesByType = stats.expensesByType.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const expenseTypeChartData = stats.expensesByType.map((item, index) => ({
    type: item.type,
    amount: item.amount,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <Icons.expenses className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.expenses.totalAmount)}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {stats.expenses.monthlyChange > 0 ? (
                <>
                  <TrendingUp className="size-3 text-red-500" />
                  <span className="text-red-500">
                    +{stats.expenses.monthlyChange.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="size-3 text-green-500" />
                  <span className="text-green-500">
                    {stats.expenses.monthlyChange.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Icons.transactions className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.expenses.transactionCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.expenses.accountCount} active accounts
            </p>
          </CardContent>
        </Card>

        {/* Total Loans Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <Icons.expenses className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.loans.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.loans.activeLoanCount} active loans
            </p>
          </CardContent>
        </Card>

        {/* Monthly EMI Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly EMI</CardTitle>
            <Icons.expenses className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.loans.totalEMI)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.loans.loanCount} total loans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses Trend</CardTitle>
            <CardDescription>Last 6 months expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.monthlyExpenses.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <BarChart data={stats.monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={8} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Type Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Type</CardTitle>
            <CardDescription>Distribution of expense types</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseTypeChartData.length > 0 ? (
              <ChartContainer config={pieChartConfig} className="mx-auto">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={expenseTypeChartData}
                    dataKey="amount"
                    nameKey="type"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {formatCurrency(totalExpensesByType)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Total
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No expense type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest 10 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Icons.transactions className="size-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description || "No description"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.account} •{" "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{transaction.type}</Badge>
                    <div className="text-right font-medium">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses by Account */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Account</CardTitle>
          <CardDescription>
            Breakdown by account (last 6 months)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.expensesByAccount.length > 0 ? (
            <div className="space-y-4">
              {stats.expensesByAccount.map((account, index) => {
                const percentage =
                  (account.amount /
                    stats.expensesByAccount.reduce(
                      (sum, a) => sum + a.amount,
                      0,
                    )) *
                  100;
                return (
                  <div key={account.account} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`,
                          }}
                        />
                        <span className="text-sm font-medium">
                          {account.account}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({account.count} transactions)
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(account.amount)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No account data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
