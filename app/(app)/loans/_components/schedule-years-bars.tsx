"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { calculateStats, PaymentScheduleYear } from "../utils";
import React from "react";
import { ScheduleYearsPieChart } from "./schedule-stats-pie";
// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

const chartConfig = {
  totalPaid: {
    label: "Total",
    color: "var(--chart-1)",
  },
  interestPaid: {
    label: "Interest",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function convertToChartData(data: PaymentScheduleYear[]) {
  return data.map((item) => ({
    year: item.year,
    paymentAmount: item.paymentAmount,
    principalPaid: item.principalPaid,
    interestPaid: item.interestPaid,
    totalPaid: item.interestPaid + item.principalPaid,
    remainingBalance: item.remainingBalance,
  }));
}

export function ScheduleYearsBarChart({
  title,
  data,
}: {
  title?: React.ReactNode;
  data: PaymentScheduleYear[];
}) {
  const chartData = React.useMemo(() => convertToChartData(data), [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              // tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="totalPaid" fill="var(--color-totalPaid)" radius={4} />
            <Bar
              dataKey="interestPaid"
              fill="var(--color-interestPaid)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {/* <div className="flex items-center gap-2">
          <TrendingUp size={16} />
          <p>Total: {chartStats.totalPaid.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} />
          <p>Principal: {chartStats.totalPrincipalPaid.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} />
          <p>Interest: {chartStats.totalInterestPaid.toFixed(2)}</p>
        </div> */}
      </CardFooter>
    </Card>
  );
}
