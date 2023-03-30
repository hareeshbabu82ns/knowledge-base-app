import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import Header from "components/Header";
import ExpensesOverviewChart from "components/ExpensesOverviewChart";
import { Stack } from "@mui/system";
import { DateTime } from "luxon";

function ExpenseStatsChart({ hideHeading = false }) {
  const [view, setView] = useState("tags");
  const [startDate, setStartDate] = useState(DateTime.now().startOf("month"));
  const [endDate, setEndDate] = useState(DateTime.now().endOf("month"));

  return (
    <Box m="1.5rem 2.5rem">
      <Header
        title="ExpenseStatsChart"
        subtitle="ExpenseStatsChart of general Revenue and Profit"
      />
      <Box height="75vh" mt={2}>
        <Box display="flex" justifyContent="space-between" px={2}>
          <FormControl>
            <InputLabel>View</InputLabel>
            <Select
              value={view}
              label="view"
              onChange={(e) => setView(e.target.value)}
            >
              <MenuItem value="tags">Tags</MenuItem>
              <MenuItem value="types">Types</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" gap={2} alignItems="center">
            <FormControl>
              <DatePicker
                value={startDate}
                format="LLL yyyy"
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                shouldDisableDate={(d) => d.day !== 1}
              />
            </FormControl>
            <Typography variant="h5">--</Typography>
            <FormControl>
              <DatePicker
                value={endDate}
                format="LLL yyyy"
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                shouldDisableDate={(d) => d.day !== d.endOf("month").day}
              />
            </FormControl>
          </Stack>
        </Box>
        <ExpensesOverviewChart
          view={view}
          startDate={startDate}
          endDate={endDate}
        />
      </Box>
    </Box>
  );
}

export default ExpenseStatsChart;
