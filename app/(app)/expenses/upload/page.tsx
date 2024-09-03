"use client";

import SingleFileUploadForm from "@/components/shared/single-file-upload-form";
import ExpenseAccountsDDLB from "./_components/accounts-ddlb";
import { useCallback, useState } from "react";
import { ExpenseAccount } from "@prisma/client";
import { uploadTransactions } from "./actions";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import Loader from "@/components/shared/loader";
import TransactionFileEntriesTable from "./_components/file-entries-table";
import TransactionUploadTable from "./_components/transactions-table";
import { Checkbox } from "@/components/ui/checkbox";

const ExpensesUploadPage = () => {
  const [selectedAccount, setSelectedAccount] = useState<
    ExpenseAccount | undefined
  >(undefined);

  const [isPreview, setIsPreview] = useState(true);
  const [data, setData] = useState<any>(undefined);
  const { mutateAsync: uploadTransactionsFn, isPending } = useMutation({
    mutationFn: uploadTransactions,
    mutationKey: ["uploadTransactions", selectedAccount?.id],
  });

  const handleOnUploadSuccess = useCallback(
    async (urls: string[]) => {
      if (!selectedAccount) {
        toast.info("Please select an Account");
        return;
      }
      try {
        const res = await uploadTransactionsFn({
          url: urls[0],
          account: selectedAccount,
          preview: isPreview,
        });
        setData(res);
        toast.info("Uploaded Successfully");
      } catch (e) {
        console.log(e);
        toast.error("An error occurred. Please try again.");
      }
    },
    [selectedAccount, isPreview, uploadTransactionsFn],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex flex-row sm:flex-col gap-4">
          <ExpenseAccountsDDLB onSelect={setSelectedAccount} />
          <div className="flex items-center space-x-2 border rounded-md h-10 px-2">
            <Checkbox
              id="preview"
              checked={isPreview}
              onCheckedChange={(v) => setIsPreview(v as boolean)}
            />
            <label
              htmlFor="preview"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-hover:cursor-pointer"
            >
              Preview Transactions
            </label>
          </div>
        </div>
        <SingleFileUploadForm
          disabled={!selectedAccount}
          label="Upload Transactions"
          allowedTypes={["text/csv"]}
          onUploadSuccess={handleOnUploadSuccess}
        />
      </div>
      {isPending && <Loader />}
      {/* {!isPending && data && (
          <pre className="text-sm">
            {JSON.stringify(data?.allTransactions, null, 2)}
          </pre>
        )} */}
      <div className="grid grid-cols-1 @5xl/main-content:grid-cols-2 gap-4">
        {!isPending && data?.allRecords && (
          <TransactionFileEntriesTable
            data={data}
            config={selectedAccount?.config as never}
          />
        )}
        {!isPending && data?.allTransactions && (
          <TransactionUploadTable
            title="All Transactions"
            data={data.allTransactions}
            config={selectedAccount?.config as never}
          />
        )}
        {!isPending && data?.finalTransactions && (
          <TransactionUploadTable
            title="Final Transactions"
            data={data.finalTransactions}
            config={selectedAccount?.config as never}
          />
        )}
        {!isPending && data?.ignoredTransactions && (
          <TransactionUploadTable
            title="Ignored Transactions"
            data={data.ignoredTransactions}
            config={selectedAccount?.config as never}
          />
        )}
      </div>
    </div>
  );
};

export default ExpensesUploadPage;
