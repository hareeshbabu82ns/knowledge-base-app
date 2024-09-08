"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { format, startOfDay, startOfMonth, startOfYear } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "hsl(var(--chart-1))",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "hsl(var(--chart-2))",
//   },
// } satisfies ChartConfig;

interface ChartAttrByDateData {
  attr: string;
  label: string;
  amount: number;
  date: Date;
}

function prepareChartData(
  data: ChartAttrByDateData[],
  attribute: "account" | "type" | "tag",
  frequency: "yearly" | "monthly" | "daily",
) {
  const chartDataByFreq: any = {};
  const config: ChartConfig = {};
  // console.log("data", data);
  data.forEach((item) => {
    const key = item.attr;
    // const key = item.attr.replace(/\s+/g, "-").toLowerCase();
    if (!config[key]) {
      config[key] = {
        label: item.label,
        color: `hsl(var(--chart-${Object.keys(config).length + 1}))`,
      };
    }
    const frequencyKey = (
      {
        daily: format(item.date, "dd MMM yy"),
        monthly: format(item.date, "MMM yy"),
        yearly: format(item.date, "yyyy"),
      } as { [key: string]: string }
    )[frequency];

    if (!chartDataByFreq[frequencyKey]) {
      chartDataByFreq[frequencyKey] = {
        frequency: frequencyKey,
      };
    }
    chartDataByFreq[frequencyKey] = {
      ...chartDataByFreq[frequencyKey],
      [key]: Math.round(item.amount),
    };
  });

  const chartData = Object.values(chartDataByFreq);
  // console.log("chartData", chartData);
  return { data: chartData, config };
}

function dataAttrByFreqency(
  transactions: any,
  attribute: "account" | "type" | "tag",
  frequency: "yearly" | "monthly" | "daily",
) {
  // console.log("transactions", transactions);
  return Object.keys(transactions).reduce(
    (acc, currAccKey) => {
      const curr = transactions[currAccKey];
      Object.keys(curr).forEach((fkey) => {
        if (!fkey.startsWith(frequency ? `${frequency}-` : attribute)) return;
        const currData = curr[fkey];
        // console.log("currData", currData);
        const freqKey = (
          {
            daily: format(currData.date, "dd-MM-yy"),
            monthly: format(currData.date, "MM-yy"),
            yearly: format(currData.date, "yyyy"),
          } as { [key: string]: string }
        )[frequency];
        const key = `${freqKey}-${currAccKey}`;
        acc[key] = {
          attr: currAccKey,
          label: currData[attribute],
          amount: currData.amount,
          date: (
            {
              daily: startOfDay(currData.date),
              monthly: startOfMonth(currData.date),
              yearly: startOfYear(currData.date),
            } as { [key: string]: Date }
          )[frequency],
        };
      });
      return acc;
    },
    {} as { [key: string]: ChartAttrByDateData },
  );
}

export function ChartAttributeByFrequency({
  transactions,
  attribute,
  frequency = "monthly",
  className,
  chartContainerClassName,
}: {
  transactions: any;
  attribute: "account" | "type" | "tag";
  frequency?: "yearly" | "monthly" | "daily";
  className?: string;
  chartContainerClassName?: string;
}) {
  const chartData = prepareChartData(
    Object.values(
      dataAttrByFreqency(
        attribute === "account"
          ? transactions?.byAccountMonthly
          : attribute === "tag"
            ? transactions?.byTagMonthly
            : transactions?.byTypeMonthly,
        attribute,
        frequency,
      ),
    ),
    attribute,
    frequency,
  );

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>
          {attribute} by {frequency}
        </CardTitle>
        <CardDescription>
          {/* <pre>{JSON.stringify(chartData.data.length, null, 2)}</pre> */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartData.config}
          className={cn("", chartContainerClassName)}
        >
          <BarChart accessibilityLayer data={chartData.data}>
            <CartesianGrid vertical={false} />
            <YAxis
              axisLine={true}
              tickLine={false}
              tickFormatter={(value) =>
                formatCurrency(value).replace(".00", "")
              }
            />
            <XAxis
              dataKey="frequency"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" className="w-60" />}
            />
            {Object.keys(chartData.config).map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
