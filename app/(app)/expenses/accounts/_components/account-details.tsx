"use client";

import { ExpenseAccount, Prisma } from "@/app/generated/prisma";
import { AccountForm } from "./account-form";
import AccountTagFieldsTable from "./config-tags-table";
import AccountFileFieldsTable from "./config-file-fields-table";
import AccountIgnoreFieldsTable from "./config-ignore-fields-table";
import AccountTextAdjustFieldsTable from "./config-text-adjust-fields-table";

const AccountDetails = ( { account }: { account: ExpenseAccount } ) => {
  return (
    <div className="flex flex-col gap-4">
      <AccountForm
        id={account.id}
        data={account}
        type={account.id === "" ? "create" : "update"}
      />

      {account.id !== "" && <AccountTagFieldsTable accountId={account.id} />}
      {account.id !== "" && <AccountFileFieldsTable accountId={account.id} />}
      {account.id !== "" && <AccountIgnoreFieldsTable accountId={account.id} />}
      {account.id !== "" && (
        <AccountTextAdjustFieldsTable accountId={account.id} />
      )}
    </div>
  );
};

export default AccountDetails;
