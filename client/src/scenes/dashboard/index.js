import React, { useState } from 'react';
import FlexBetween from 'components/FlexBetween';
import Header from 'components/Header';
import { DownloadOutlined, Email, PointOfSale, PersonAdd, Traffic } from '@mui/icons-material';
import { Box, Button, useTheme, useMediaQuery, Stack } from '@mui/material';
import StatBox from 'components/StatBox';
import { DateTime } from 'luxon';
import ExpensesOverviewChart from 'components/ExpensesOverviewChart';

const Dashboard = () => {
  const theme = useTheme();

  const [startDate] = useState(DateTime.now().startOf('year'));
  const [endDate] = useState(DateTime.now().minus({ month: 1 }).endOf('month'));

  const isNonMediumScreens = useMediaQuery('(min-width: 1200px)');

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <Stack direction="row" columnGap={2} alignItems="center">
          <Button
            sx={{
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '10px 20px',
            }}
            color="primary"
            variant="contained"
          >
            <DownloadOutlined sx={{ mr: '10px' }} />
            Download Reports
          </Button>
        </Stack>
      </FlexBetween>

      <Box
        mt="20px"
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="160px"
        gap="20px"
        sx={{
          '& > div': { gridColumn: isNonMediumScreens ? undefined : 'span 12' },
        }}
      >
        {/* ROW 1 */}

        <StatBox
          title="Total Customers"
          value={333}
          increase="+14%"
          description="Since last month"
          icon={
            <Email
              sx={{
                color: theme.palette.text.onTileSecondary,
                fontSize: '26px',
              }}
            />
          }
        />
        <StatBox
          title="Sales Today"
          value={443}
          increase="+21%"
          description="Since last month"
          icon={
            <PointOfSale
              sx={{
                color: theme.palette.text.onTileSecondary,
                fontSize: '26px',
              }}
            />
          }
        />
        <StatBox
          title="Monthly Sales"
          value={2344}
          increase="+5%"
          description="Since last month"
          icon={
            <PersonAdd
              sx={{
                color: theme.palette.text.onTileSecondary,
                fontSize: '26px',
              }}
            />
          }
        />
        <StatBox
          title="Yearly Sales"
          value={1352}
          increase="+43%"
          description="Since last month"
          icon={
            <Traffic
              sx={{
                color: theme.palette.text.onTileSecondary,
                fontSize: '26px',
              }}
            />
          }
        />

        {/* ROW 2 */}

        <Box
          height="40vh"
          mt={2}
          borderRadius={2}
          padding={1}
          backgroundColor={theme.palette.background.tile}
          gridColumn="span 6"
          gridRow="span 3"
        >
          <ExpensesOverviewChart view="types" startDate={startDate} endDate={endDate} />
        </Box>

        <Box
          height="40vh"
          mt={2}
          borderRadius={2}
          padding={1}
          backgroundColor={theme.palette.background.tile}
          gridColumn="span 6"
          gridRow="span 3"
        >
          <ExpensesOverviewChart view="tags" startDate={startDate} endDate={endDate} />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
