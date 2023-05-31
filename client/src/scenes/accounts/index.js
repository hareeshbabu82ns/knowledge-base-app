import { Box, Stack, Tab, Tabs } from "@mui/material";
import React from "react";
import { v4 as uuidV4 } from "uuid";
import Header from "components/Header";
import AccountForm from "./AccountForm";
import { ACCOUNT_TYPES, EXPENSE_FIELDS } from "constants";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import AccountsGrid from "./AccountsGrid";
import AccountTransactionUploader from "./AccountTransactionUploader";
import AccountConfigForm from "./AccountConfigForm";
import { useUpdateExpenseAccountMutation } from "state/api";
import { COMPARISION_OPS_EQ } from "constants";

const initFormData = {
  name: "",
  type: ACCOUNT_TYPES[0],
  description: "",
  config: {
    headerLines: 0,
    separator: ",",
    trimQuotes: false,
    ignoreOps: [
      {
        name: "description",
        comparision: COMPARISION_OPS_EQ,
        value: "",
        _id: uuidV4(),
      },
    ],
    fileFields: [
      {
        name: "postingDate",
        type: "date",
        format: "LL/dd/yyyy",
        negated: false,
        ignore: false,
        timeColumnIndex: 0,
        expenseColumn: "date",
        _id: uuidV4(),
      },
      {
        name: "description",
        type: "string",
        format: "",
        negated: false,
        ignore: false,
        timeColumnIndex: 0,
        expenseColumn: "description",
        _id: uuidV4(),
      },
      {
        name: "creditAmount",
        type: "amount",
        format: "",
        negated: false,
        ignore: false,
        timeColumnIndex: 0,
        expenseColumn: "amount",
        _id: uuidV4(),
      },
      {
        name: "dipositAmount",
        type: "amount",
        format: "",
        negated: false,
        ignore: false,
        timeColumnIndex: 0,
        expenseColumn: "amount",
        _id: uuidV4(),
      },
      {
        name: "balanceAmount",
        type: "amount",
        format: "",
        negated: false,
        ignore: false,
        timeColumnIndex: 0,
        expenseColumn: EXPENSE_FIELDS[0],
        _id: uuidV4(),
      },
    ],
  },
};

const Accounts = () => {
  const [updateAccount] = useUpdateExpenseAccountMutation();

  const [selectedAccount, setSelectedAccount] = React.useState(initFormData);

  const onAccountUpdate = async (postData) => {
    const payload = await updateAccount({
      ...selectedAccount,
      id: selectedAccount._id,
      ...postData,
    }).unwrap();
    return payload;
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Grid container spacing={2}>
        <Grid xs={12} lg={6}>
          <Stack spacing={4}>
            <Header title={`Accounts `} subtitle="List of Accounts" />

            <AccountForm
              key={selectedAccount?._id}
              accountData={selectedAccount}
              updateAccount={onAccountUpdate}
            />

            <AccountsGrid
              selectedAccount={selectedAccount}
              onRowSelected={(tr) => {
                setSelectedAccount(tr || initFormData);
              }}
            />
          </Stack>
        </Grid>
        <Grid xs={12} lg={6}>
          <Stack spacing={4}>
            <Header title={`Account Details`} subtitle="Config and Uploads" />
            <AccountDetailTabs
              key={selectedAccount?._id}
              account={selectedAccount}
              onConfigUpdate={onAccountUpdate}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountDetailTabs = ({ account, onConfigUpdate }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Account Detail Tabs"
        >
          <Tab label="Account Config" />
          <Tab label="Expense Uploads" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <AccountConfigForm account={account} onConfigUpdate={onConfigUpdate} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AccountTransactionUploader account={account} />
      </TabPanel>
    </>
  );
};

export default Accounts;
