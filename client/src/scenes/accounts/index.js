import { Box, Stack, useTheme } from "@mui/material";
import React, { useState } from "react";
import { DateTime } from "luxon";
import Header from "components/Header";

import AccountForm from "./AccountForm";
import { ACCOUNT_TYPES } from "constants";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import AccountsGrid from "./AccountsGrid";
import AccountTransactionUploader from "./AccountTransactionUploader";

const initFormData = {
  name: "",
  type: ACCOUNT_TYPES[0],
  description: "",
};

const Accounts = () => {
  const [selectedAccount, setSelectedAccount] = React.useState(initFormData);

  return (
    <Box m="1.5rem 2.5rem">
      <Grid container spacing={2}>
        <Grid xs={12} lg={6}>
          <Stack spacing={4}>
            <Header title={`Accounts `} subtitle="List of Accounts" />

            <AccountForm
              key={selectedAccount?._id}
              accountData={selectedAccount}
            />

            <AccountsGrid
              selectedAccount={selectedAccount}
              onRowSelected={(tr) => {
                // console.log( tr )
                setSelectedAccount(tr || initFormData);
              }}
            />
          </Stack>
        </Grid>
        <Grid xs={12} lg={6}>
          <Stack spacing={4}>
            <Header title={`Account Uploads`} subtitle="Upload Trnasactions" />
            <AccountTransactionUploader />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Accounts;
