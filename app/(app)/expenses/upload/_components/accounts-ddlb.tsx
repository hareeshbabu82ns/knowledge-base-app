"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/shared/loader";
import { useState } from "react";
import { fetchAccounts } from "../../accounts/actions";
import { ExpenseAccount } from "@/app/generated/prisma";

const ExpenseAccountsDDLB = ( {
  onSelect,
}: {
  onSelect: ( account?: ExpenseAccount ) => void;
} ) => {
  const [ selected, setSelected ] = useState<string>( "" );

  const {
    data: accountsDDLB,
    isLoading,
    isFetching,
  } = useQuery( {
    queryKey: [ "accountsDDLB" ],
    queryFn: async () => await fetchAccounts(),
  } );

  if ( isLoading || isFetching ) return <Loader />;

  return (
    <div>
      <Select
        onValueChange={( v ) => {
          const acc = accountsDDLB?.find( ( a ) => a.id === v );
          onSelect && onSelect( acc );
          setSelected( v );
        }}
        value={selected || ""}
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
    </div>
  );
};

export default ExpenseAccountsDDLB;
