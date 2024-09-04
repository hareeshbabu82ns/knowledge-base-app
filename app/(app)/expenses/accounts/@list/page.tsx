"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import AccountsTable from "../_components/accounts-table";
import { fetchAccounts, uploadAccounts } from "../actions";
import SingleFileUploadForm from "@/components/shared/single-file-upload-form";
import { toast } from "sonner";
import Loader from "@/components/shared/loader";

function Page() {
  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => await fetchAccounts(),
  });

  const { mutateAsync: uploadAccountsFn, isPending: isPendingUpload } =
    useMutation({
      mutationFn: uploadAccounts,
      mutationKey: ["uploadAccounts"],
    });

  if (isPending) {
    return <Loader />;
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
        disabled={isPendingUpload}
        loading={isPendingUpload}
        showPreviews={false}
        onUploadSuccess={async (url) => {
          return uploadAccountsFn(url[0]).then(() => {
            refetch();
            toast.success("Accounts uploaded successfully!", {
              id: "upload-accounts-success",
            });
          });
        }}
      />
      {/* <MultipleFileUploadForm
        allowedTypes={["all", "application/pdf", "image"]}
      /> */}
    </div>
  );
}

export default Page;
