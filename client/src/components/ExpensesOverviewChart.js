import React, { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";

import {
  useGetExpenseTagStatsQuery,
  useGetExpenseTypeStatsQuery,
} from "state/api";
import { DateTime } from "luxon";

function ExpensesOverviewChart({
  isDashboard = false,
  view,
  startDate,
  endDate,
}) {
  const theme = useTheme();
  const isDark = theme.palette.isDark;
  const { data, isLoading } = useGetExpenseTagStatsQuery({
    depth: "monthly",
    dateFrom: startDate.toISO(),
    dateTo: endDate.toISO(),
  });
  const { data: dataTypes, isLoading: isLoadingTypes } =
    useGetExpenseTypeStatsQuery({
      depth: "monthly",
      dateFrom: startDate.toISO(),
      dateTo: endDate.toISO(),
    });

  const [totalTags, totalTypes] = useMemo(() => {
    const totalTags = data
      ? data.stats.reduce((acc, { tag, monthlyData, year, yearlyTotal }) => {
          const mdata = monthlyData.map(({ month, total }) => {
            const dt = DateTime.local(year, month, 1);
            return {
              tag,
              monthYear: dt.toFormat("LLL yy"),
              year,
              yearlyTotal,
              month,
              x: dt.toFormat("LLL yy"),
              monthlyTotal: total,
              y: total,
            };
          });

          const tagData = {
            id: tag,
            color: theme.palette.secondary.main,
            data: mdata,
          };

          return [...acc, tagData];
        }, [])
      : [];

    const totalTypes = dataTypes
      ? dataTypes.stats.reduce(
          (acc, { type, monthlyData, year, yearlyTotal }) => {
            const mdata = monthlyData.map(({ month, total }) => {
              const dt = DateTime.local(year, month, 1);
              return {
                type,
                monthYear: dt.toFormat("LLL yy"),
                year,
                yearlyTotal,
                month,
                x: dt.toFormat("LLL yy"),
                monthlyTotal: total,
                y: total,
              };
            });

            const typeData = {
              id: type,
              color: theme.palette.secondary[600],
              data: mdata,
            };

            return [...acc, typeData];
          },
          []
        )
      : [];

    // console.log(totalTags, totalTypes);
    return [totalTags, totalTypes];
  }, [data, dataTypes, theme]);

  if (!data || isLoading) return <>Loading...</>;

  return (
    <ResponsiveLine
      data={view === "tags" ? totalTags : totalTypes}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: theme.palette.text.onTileTertiary,
            },
          },
          legend: {
            text: {
              fill: theme.palette.text.onTileTertiary,
            },
          },
          ticks: {
            line: {
              stroke: theme.palette.text.onTileTertiary,
              strokeWidth: 1,
            },
            text: {
              fill: theme.palette.text.primary,
            },
          },
        },
        legends: {
          text: {
            fill: theme.palette.text.onTilePrimary,
          },
        },
        tooltip: {
          container: {
            color: theme.palette.grey[isDark ? 200 : 900],
          },
        },
      }}
      margin={{ top: 20, right: 50, bottom: 50, left: 70 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      enableArea={isDashboard}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        format: (v) => {
          if (isDashboard) return v.slice(0, 3);
          return v;
        },
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? "" : "Monthly Total",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5,
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard
          ? ""
          : `Amount by ${view === "tags" ? "Tag" : "Type"}`,
        legendOffset: -60,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={
        !isDashboard
          ? [
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 30,
                translateY: -40,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]
          : undefined
      }
    />
  );
}

export default ExpensesOverviewChart;