import React from "react";
import { getAccountDetails } from "../../actions";
import AccountDetails from "../../_components/account-details";

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

const Page = async ({ params: { id } }: { params: { id: string } }) => {
  try {
    const item =
      id === "new"
        ? defaultAccount
        : await getAccountDetails(decodeURIComponent(id));

    return (
      <div>
        <AccountDetails account={item} />
      </div>
    );
  } catch (error) {
    console.log(error);
    return <div>Account not found with id: {decodeURIComponent(id)}</div>;
  }
};

export default Page;
