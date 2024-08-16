"use client";

import { useQuery } from "@tanstack/react-query";
import AccountsTable from "../_components/accounts-table";
import { fetchAccounts } from "../actions";

function Page() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => await fetchAccounts(),
  });

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  // We can assume by this point that `isSuccess === true`
  return <AccountsTable tableData={data} />;
}

export default Page;
