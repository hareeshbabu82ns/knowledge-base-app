"use client";

import { ExpenseAccount, Prisma } from "@prisma/client";
import { AccountForm } from "./account-form";

const AccountDetails = ({ account }: { account: ExpenseAccount }) => {
  return (
    <div>
      <AccountForm
        id={account.id}
        data={account}
        type={account.id === "" ? "create" : "update"}
      />
    </div>
  );
};

export default AccountDetails;
