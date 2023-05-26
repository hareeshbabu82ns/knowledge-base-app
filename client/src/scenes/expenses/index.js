import { Box, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { DateTime } from "luxon";
import Header from "components/Header";

import TransactionForm from "./TransactionForm";
import { EXPENSE_TYPES } from "constants";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import TransactionsGrid from "./TransactionsGrid";
import ExpenseStatsChart from "scenes/dashboard/ExpenseStats";
import ExpensesOverviewChart from "components/ExpensesOverviewChart";
import { getBackgroundColor, toneByMode } from "themes/utils";

const initFormData = {
  amount: 0,
  type: EXPENSE_TYPES[0],
  tags: "",
  date: DateTime.now(),
  account: "",
  description: "",
};
// const initFormData = {
//   amount: Math.random() * 134,
//   type: EXPENSE_TYPES[ 0 ],
//   tags: 'ui,test',
//   date: new Date(),
//   account: "",
//   description: "",
// }

const Transactions = () => {
  const theme = useTheme();

  const [selectedTransaction, setSelectedTransaction] =
    React.useState(initFormData);
  const [startDate, setStartDate] = useState(DateTime.now().startOf("year"));
  const [endDate, setEndDate] = useState(DateTime.now().endOf("year"));
  const isDark = theme.palette.mode === "dark";

  return (
    <Box m="1.5rem 2.5rem">
      <Header title={`Transactions `} subtitle="List of Trnasactions" />

      <Grid container spacing={2}>
        <Grid xs={12} lg={6}>
          <Box
            height="40vh"
            mt={2}
            borderRadius={2}
            padding={1}
            backgroundColor={theme.palette.background.tile}
          >
            <ExpensesOverviewChart
              view="tags"
              startDate={startDate}
              endDate={endDate}
            />
          </Box>
          <Box
            height="40vh"
            mt={2}
            borderRadius={2}
            padding={1}
            backgroundColor={theme.palette.background.tile}
          >
            <ExpensesOverviewChart
              view="types"
              startDate={startDate}
              endDate={endDate}
            />
          </Box>
        </Grid>
        <Grid xs={12} lg={6}>
          <TransactionForm
            key={selectedTransaction?._id}
            transactionData={selectedTransaction}
          />

          <TransactionsGrid
            selectedTransaction={selectedTransaction}
            onRowSelected={(tr) => {
              // console.log( tr )
              setSelectedTransaction(tr || initFormData);
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Transactions;
