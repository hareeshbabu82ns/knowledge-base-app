import AccountsTable from "../_components/accounts-table";
import { fetchAccounts } from "../actions";

async function Page() {
  const accounts = await fetchAccounts();
  return (
    <div>
      <AccountsTable tableData={accounts} />
    </div>
  );
}

export default Page;
