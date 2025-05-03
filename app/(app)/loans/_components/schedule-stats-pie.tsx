"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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

// const chartData = [
//   { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
//   { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
//   { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
//   { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
//   { browser: "other", visitors: 190, fill: "var(--color-other)" },
// ];

const chartConfig = {
  amount: {
    label: "Total",
  },
  principal: {
    label: "Principal",
    color: "var(--chart-1)",
  },
  interest: {
    label: "Interest",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function convertToChartData( data: PaymentScheduleYear[] ) {
  const stats = calculateStats( data );
  return [
    {
      paid: "Principal",
      amount: stats.totalPrincipalPaid,
      fill: "var(--color-principal)",
    },
    {
      paid: "Interest",
      amount: stats.totalInterestPaid,
      fill: "var(--color-interest)",
    },
  ];
}

export function ScheduleYearsPieChart( {
  title,
  data,
}: {
  title?: React.ReactNode;
  data: PaymentScheduleYear[];
} ) {
  const chartStats = React.useMemo( () => calculateStats( data ), [ data ] );
  const chartData = React.useMemo( () => convertToChartData( data ), [ data ] );

  const totalPaid = chartStats.totalPaid;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="paid"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={( { viewBox } ) => {
                  if ( viewBox && "cx" in viewBox && "cy" in viewBox ) {
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
                          {totalPaid.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={( viewBox.cy || 0 ) + 24}
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
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2 text-sm">
        <div className="flex w-[150px] flex-row items-center justify-between">
          <span>Total:</span>
          <p className="text-muted text-lg">
            {chartStats.totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="flex w-[150px] flex-row items-center justify-between">
          <span>Principal:</span>
          <p className="text-primary text-lg">
            {chartStats.totalPrincipalPaid.toLocaleString()}
          </p>
        </div>
        <div className="flex w-[150px] flex-row items-center justify-between">
          <span>Interest:</span>
          <p className="text-destructive text-lg">
            {chartStats.totalInterestPaid.toLocaleString()}
          </p>
        </div>
        {/* <pre>{JSON.stringify(chartStats, null, 2)}</pre> */}
      </CardFooter>
    </Card>
  );
}
