import React from 'react';
import PageContainer from 'components/container/PageContainer';
import { Outlet } from 'react-router-dom';

// const initFormData = {
//   amount: Math.random() * 134,
//   type: EXPENSE_TYPES[ 0 ],
//   tags: 'ui,test',
//   date: new Date(),
//   account: "",
//   description: "",
// }

const Transactions = () => {
  return (
    <PageContainer title="Transactions" description="List of Trnasactions">
      <Outlet />
    </PageContainer>
  );
};

export default Transactions;
