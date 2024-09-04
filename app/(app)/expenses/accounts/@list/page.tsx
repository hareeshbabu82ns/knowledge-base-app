"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import AccountsTable from "../_components/accounts-table";
import { fetchAccounts, uploadAccounts, uploadTags } from "../actions";
import SingleFileUploadForm from "@/components/shared/single-file-upload-form";
import { toast } from "sonner";
import Loader from "@/components/shared/loader";
import TagsTable from "../_components/tags-table";

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
  const { mutateAsync: uploadTagsFn, isPending: isPendingUploadTags } =
    useMutation({
      mutationFn: uploadTags,
      mutationKey: ["uploadTags"],
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
        label="Upload Accounts"
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
      <TagsTable />
      <SingleFileUploadForm
        label="Upload Tags"
        allowedTypes={["application/json"]}
        disabled={isPendingUploadTags}
        loading={isPendingUploadTags}
        showPreviews={false}
        onUploadSuccess={async (url) => {
          return uploadTagsFn(url[0]).then(() => {
            refetch();
            toast.success("Tags uploaded successfully!", {
              id: "upload-tags-success",
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
