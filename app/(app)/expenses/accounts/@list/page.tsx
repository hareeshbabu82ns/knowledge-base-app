"use client";

import { useQuery } from "@tanstack/react-query";
import AccountsTable from "../_components/accounts-table";
import { fetchAccounts, uploadAccounts } from "../actions";
import SingleFileUploadForm from "@/components/shared/single-file-upload-form";
import { toast } from "sonner";

function Page() {
  const { isPending, isError, data, error, refetch } = useQuery({
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
  return (
    <div className="flex flex-col gap-2">
      <AccountsTable tableData={data} refetch={() => refetch()} />
      <SingleFileUploadForm
        label="Upload CSV file"
        allowedTypes={["application/json"]}
        showPreviews={false}
        onUploadSuccess={async (url) => {
          await uploadAccounts(url[0]);
          await refetch();
          toast.success("Accounts uploaded successfully!");
        }}
      />
      {/* <MultipleFileUploadForm
        allowedTypes={["all", "application/pdf", "image"]}
      /> */}
    </div>
  );
}

export default Page;
