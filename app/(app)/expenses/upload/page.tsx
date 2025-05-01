"use client";

import SingleFileUploadForm from "@/components/shared/single-file-upload-form";
import { useCallback, useState } from "react";
import { ExpenseAccount } from "@/app/generated/prisma";
import { uploadTransactions } from "./actions";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import Loader from "@/components/shared/loader";
import TransactionFileEntriesTable from "./_components/file-entries-table";
import TransactionUploadTable from "./_components/transactions-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAccounts } from "../accounts/actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Icons } from "@/components/shared/icons";

const ExpensesUploadPage = () => {
  const [ selectedAccount, setSelectedAccount ] = useState<
    ExpenseAccount | undefined
  >( undefined );

  const [ isPreview, setIsPreview ] = useState( true );
  const [ data, setData ] = useState<any>( undefined );
  const [ urls, setUrls ] = useState<string[]>( [] );
  // const [urls, setUrls] = useState<string[]>([
  //   "/uploads/2024-09-06/2024-09-06-2024-02-ATB-Har-CC.csv-759208900.csv",
  // ]);
  const { mutateAsync: uploadTransactionsFn, isPending } = useMutation( {
    mutationFn: uploadTransactions,
    mutationKey: [ "uploadTransactions", selectedAccount?.id ],
  } );

  const {
    data: accountsDDLB,
    isLoading,
    isFetching,
  } = useQuery( {
    queryKey: [ "accountsDDLB" ],
    queryFn: async () => await fetchAccounts(),
  } );

  const handleOnChangeFiles = useCallback(
    ( files: File[] ) => {
      if ( files.length === 0 ) {
        return;
      }
      const fileName = files[ 0 ].name;
      const acc = accountsDDLB?.find( ( a ) => fileName.includes( a.name ) );
      setSelectedAccount( acc?.id ? acc : undefined );
    },
    [ accountsDDLB ],
  );

  const handleOnUploadSuccess = useCallback(
    async ( urls: string[] ) => {
      if ( !selectedAccount ) {
        toast.info( "Please select an Account" );
        return;
      }
      try {
        const res = await uploadTransactionsFn( {
          url: urls[ 0 ],
          account: selectedAccount,
          preview: isPreview,
        } );
        setData( res );
        setUrls( urls );
        toast.info( `Uploaded Successfully? ${isPreview ? "Preview" : "DB"}` );
      } catch ( e ) {
        console.log( e );
        toast.error( "An error occurred. Please try again." );
      }
    },
    [ selectedAccount, isPreview, uploadTransactionsFn ],
  );

  if ( isLoading || isFetching ) return <Loader />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex flex-row gap-4 sm:flex-col">
          {/* <ExpenseAccountsDDLB onSelect={setSelectedAccount} /> */}
          <Select
            onValueChange={( v ) => {
              const acc = accountsDDLB?.find( ( a ) => a.id === v );
              setSelectedAccount( acc );
            }}
            value={selectedAccount?.id || ""}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select an Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Accounts</SelectLabel>
                {accountsDDLB?.map( ( acc ) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ) )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex h-10 items-center space-x-2 rounded-md border px-2">
            <Checkbox
              id="preview"
              checked={isPreview}
              onCheckedChange={( v ) => setIsPreview( v as boolean )}
            />
            <label
              htmlFor="preview"
              className="text-sm font-medium leading-none peer-hover:cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Preview Transactions
            </label>
          </div>
          <Button
            variant="outline"
            disabled={!urls || urls.length === 0}
            type="button"
            onClick={() => {
              setData( undefined );
              handleOnUploadSuccess( urls );
            }}
          >
            Re Process
          </Button>
        </div>
        <SingleFileUploadForm
          // disabled={!selectedAccount}
          label="Upload Transactions"
          allowedTypes={[ "text/csv" ]}
          onUploadSuccess={handleOnUploadSuccess}
          onChangeFiles={handleOnChangeFiles}
        />
      </div>
      {isPending && <Loader />}
      {/* {!isPending && data && (
          <pre className="text-sm">
            {JSON.stringify(data?.allTransactions, null, 2)}
          </pre>
        )} */}
      <div className="@7xl/main-content:grid-cols-2 grid grid-cols-1 gap-4">
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
        {!isPending && data?.allRecords && (
          <TransactionFileEntriesTable
            data={data}
            config={selectedAccount?.config as never}
          />
        )}
      </div>
    </div>
  );
};

export default ExpensesUploadPage;
