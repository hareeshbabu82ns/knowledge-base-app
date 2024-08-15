import { ExpenseAccount } from "@prisma/client";

const AccountDetails = ({ account }: { account: ExpenseAccount }) => {
  return (
    <div>
      <pre>{JSON.stringify(account, null, "\n")}</pre>
    </div>
  );
};

export default AccountDetails;
