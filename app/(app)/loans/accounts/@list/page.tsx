"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLoans } from "../actions";
import LoansTable from "../_components/loans-table";

function Page() {
  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => await fetchLoans(),
  });

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return <LoansTable data={data} refetch={() => refetch()} />;
}

export default Page;
