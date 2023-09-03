import React, { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Box, Stack, useTheme } from '@mui/material';

import {
  useGetExpenseTagStatsQuery,
  useGetExpenseTypeStatsQuery,
  useGetExpenseUserStatsQuery,
} from 'state/api';
import { DateTime } from 'luxon';
import { LoadingProgress } from './LoadingProgress';

function ExpensesOverviewChart({ isDashboard = false, view, startDate, endDate, selectedTags }) {
  const theme = useTheme();
  const isDark = theme.palette.isDark;
  const { data: dataTags, isLoading: isLoadingTags } = useGetExpenseTagStatsQuery({
    tags: selectedTags,
    depth: 'monthly',
    dateFrom: startDate.toISO(),
    dateTo: endDate.toISO(),
  });
  const { data: dataTypes, isLoading: isLoadingTypes } = useGetExpenseTypeStatsQuery({
    depth: 'monthly',
    dateFrom: startDate.toISO(),
    dateTo: endDate.toISO(),
  });
  const { data: dataUser, isLoading: isLoadingUser } = useGetExpenseUserStatsQuery({
    depth: 'monthly',
    dateFrom: startDate.toISO(),
    dateTo: endDate.toISO(),
  });

  const [totalTags, totalTypes, totalUser] = useMemo(() => {
    const totalTags = dataTags
      ? Object.keys(dataTags.stats).reduce((acc, tag) => {
          const mdata = dataTags.stats[tag]?.map(({ year, month, total }) => {
            const dt = DateTime.local(year, month, 1);
            return {
              tag,
              monthYear: dt.toFormat('LLL yy'),
              year,
              month,
              x: dt.toFormat('LLL yy'),
              total,
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
      ? Object.keys(dataTypes.stats).reduce((acc, type) => {
          const mdata = dataTypes.stats[type]?.map(({ year, month, total }) => {
            const dt = DateTime.local(year, month, 1);
            return {
              type,
              monthYear: dt.toFormat('LLL yy'),
              year,
              month,
              x: dt.toFormat('LLL yy'),
              total,
              y: total,
            };
          });

          const typeData = {
            id: type,
            color: theme.palette.secondary[600],
            data: mdata,
          };

          return [...acc, typeData];
        }, [])
      : [];

    const totalUser = dataUser
      ? [
          {
            id: 'tally',
            color: theme.palette.secondary[600],
            data: dataUser.stats?.map(({ year, month, total }) => {
              const dt = DateTime.local(year, month, 1);
              return {
                monthYear: dt.toFormat('LLL yy'),
                year,
                month,
                x: dt.toFormat('LLL yy'),
                total,
                y: total,
              };
            }),
          },
        ]
      : [];

    return [totalTags, totalTypes, totalUser];
  }, [dataTags, dataTypes, dataUser, theme]);

  if (!dataTags || isLoadingTags) return <LoadingProgress />;

  return (
    <ResponsiveLine
      data={view === 'tags' ? totalTags : view === 'types' ? totalTypes : totalUser}
      tooltip={({ point }) => {
        return <CustomToolTip point={point} />;
      }}
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
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      enableArea={isDashboard}
      areaBlendMode="multiply"
      areaOpacity={0.55}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        format: (v) => {
          if (isDashboard) return v.slice(0, 3);
          return v;
        },
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? '' : 'Monthly Total',
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        orient: 'left',
        tickValues: 5,
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? '' : `Amount by ${view === 'tags' ? 'Tag' : 'Type'}`,
        legendOffset: -60,
        legendPosition: 'middle',
      }}
      enableGridX={false}
      enableGridY={false}
      lineWidth={3}
      activeLineWidth={6}
      inactiveLineWidth={3}
      inactiveOpacity={0.15}
      pointSize={10}
      activePointSize={16}
      inactivePointSize={0}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={3}
      activePointBorderWidth={3}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      colors={{ scheme: 'dark2' }}
      useMesh={true}
      // enableSlices="x"
      legends={
        !isDashboard
          ? [
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 30,
                translateY: -40,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
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

const CustomToolTip = ({ point }) => {
  const theme = useTheme();
  // console.log(point);
  return (
    <Box color={theme.palette.getContrastText(point.borderColor)} bgcolor={point.borderColor} p={1}>
      <Stack>
        <div>
          {point.data?.type
            ? `Type: ${point.data?.type}`
            : point.data?.tag
            ? `Tag: ${point.data?.tag}`
            : ''}
        </div>
        <div>Date: {point.data?.xFormatted}</div>
        <div>Total: {point.data?.yFormatted}</div>
      </Stack>
    </Box>
  );
};

export default ExpensesOverviewChart;
