import React from "react";
import { getAccountDetails } from "../../actions";
import AccountDetails from "../../_components/account-details";

const Page = async ({ params: { id } }: { params: { id: string } }) => {
  try {
    const item = await getAccountDetails(decodeURIComponent(id));

    return (
      <div>
        Account Details
        <AccountDetails account={item} />
      </div>
    );
  } catch (error) {
    return <div>Account not found with id: {decodeURIComponent(id)}</div>;
  }
};

export default Page;
