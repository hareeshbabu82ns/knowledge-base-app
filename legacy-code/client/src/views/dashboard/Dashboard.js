import React from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from 'components/container/PageContainer.js';

// components
import SalesOverview from './components/SalesOverview.js';
import YearlyBreakup from './components/YearlyBreakup.js';
import RecentTransactions from './components/RecentTransactions.js';
import ProductPerformance from './components/ProductPerformance.js';
import Blog from './components/Blog.js';
import MonthlyEarnings from './components/MonthlyEarnings.js';

const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <SalesOverview />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <YearlyBreakup />
              </Grid>
              <Grid item xs={12}>
                <MonthlyEarnings />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={4}>
            <RecentTransactions />
          </Grid>
          <Grid item xs={12} lg={8}>
            <ProductPerformance />
          </Grid>
          <Grid item xs={12}>
            <Blog />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
