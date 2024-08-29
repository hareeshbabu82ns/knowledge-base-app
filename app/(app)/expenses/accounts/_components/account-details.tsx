"use client";

import { ExpenseAccount, Prisma } from "@prisma/client";
import { AccountForm } from "./account-form";
import AccountTagFieldsTable from "./config-tags-table";

const AccountDetails = ({ account }: { account: ExpenseAccount }) => {
  return (
    <div className="flex flex-col gap-4">
      <AccountForm
        id={account.id}
        data={account}
        type={account.id === "" ? "create" : "update"}
      />

      {account.id !== "" && <AccountTagFieldsTable accountId={account.id} />}
    </div>
  );
};

export default AccountDetails;
