import React from "react";
import AccountTransactionUploader from "./AccountTransactionUploader";
import { Box } from "@mui/material";
import Header from "components/Header";

const AccountsPage = () => {
  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Accounts" subtitle="List of Accounts" />
      <Box mt="40px">
        <AccountTransactionUploader />
      </Box>
    </Box>
  );
};

export default AccountsPage;
