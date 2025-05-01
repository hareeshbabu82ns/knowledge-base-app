"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getLoanDetails } from "../../actions";
import LoanDetails from "../../_components/loan-details";
import { Loan } from "@/app/generated/prisma";

const defaultLoan = {
  id: "",
  userId: "",
  name: "",
  description: "",
  amount: 0,
  durationMonths: 360,
  emi: 0,
  frequency: "BIWEEKLY",
  interestRate: 0.0,
  startDate: new Date(),
} as Loan;

function Page() {
  const params = useParams();
  const id = decodeURIComponent( params.id as string );
  const { isPending, isError, data, error } = useQuery( {
    queryKey: [ "loan", id ],
    queryFn: async () => await getLoanDetails( id ),
    enabled: id !== "new",
  } );

  if ( id !== "new" && isPending ) {
    return <span>Loading...</span>;
  }

  if ( isError ) {
    toast.error( error.message, { id: `${id}-error` } );
    // return <span>Error: {error.message}</span>;
    return null;
  }

  // We can assume by this point that `isSuccess === true`
  return <LoanDetails loan={id === "new" ? defaultLoan : data!} />;
}

export default Page;
