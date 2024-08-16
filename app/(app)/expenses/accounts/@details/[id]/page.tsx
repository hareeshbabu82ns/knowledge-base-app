"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAccountDetails } from "../../actions";
import AccountDetails from "../../_components/account-details";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const defaultAccount = {
  id: "",
  userId: "",
  name: "",
  description: "",
  config: {},
  type: "Credit Card",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function Page() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["account", id],
    queryFn: async () => await getAccountDetails(id),
    enabled: id !== "new",
  });

  if (id !== "new" && isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    toast.error(error.message, { id: `${id}-error` });
    // return <span>Error: {error.message}</span>;
    return null;
  }

  // We can assume by this point that `isSuccess === true`
  return <AccountDetails account={id === "new" ? defaultAccount : data!} />;
}

export default Page;
