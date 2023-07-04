import { Box } from '@mui/material';
import React from 'react';
import { DateTime } from 'luxon';
import Header from 'components/Header';

import TransactionForm from './TransactionForm';
import { EXPENSE_TYPES } from 'constants';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import TransactionsGrid from './TransactionsGrid';

const initFormData = {
  amount: 0,
  type: EXPENSE_TYPES[0],
  tags: '',
  date: DateTime.now(),
  account: '',
  description: '',
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
  const [selectedTransaction, setSelectedTransaction] = React.useState(initFormData);

  return (
    <Box m="1.5rem 2.5rem">
      <Header title={`Transactions `} subtitle="List of Trnasactions" />

      <Grid container spacing={2}>
        <Grid xs={12}>
          <TransactionForm key={selectedTransaction?._id} transactionData={selectedTransaction} />

          <TransactionsGrid
            selectedTransaction={selectedTransaction}
            onRowSelected={(tr) => {
              const trans = tr || initFormData;
              // console.log( tr )
              setSelectedTransaction({
                ...trans,
                account: trans.account?._id || trans.account,
              });
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Transactions;
