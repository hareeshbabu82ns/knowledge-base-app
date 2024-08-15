"use client";

import { ExpenseAccount } from "@prisma/client";
import { AccountForm } from "./account-form";

const AccountDetails = ({ account }: { account: ExpenseAccount }) => {
  return (
    <div>
      <AccountForm id={account.id} data={account} type="update" />
    </div>
  );
};

export default AccountDetails;
