import React from 'react';
import PageContainer from 'components/container/PageContainer';
import { Outlet } from 'react-router-dom';

const Transactions = () => {
  return (
    <PageContainer title="Activities">
      <Outlet />
    </PageContainer>
  );
};

export default Transactions;
