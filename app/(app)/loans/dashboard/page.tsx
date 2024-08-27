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
import { fetchLoansDDLB } from "../accounts/actions";
import Loader from "@/components/shared/loader";
import { useState } from "react";
import LoanDash from "./loan-dash";
import { getLoanDetailsWithSub } from "./actions";
import { LoanDetails } from "@/types/loans";

const LoansPage = () => {
  const [selectedLoan, setSelectedLoan] = useState<string>("");

  const {
    data: loansDDLB,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["loansDDLB"],
    queryFn: async () => await fetchLoansDDLB(),
  });

  const {
    data: loanData,
    isLoading: isLoadingLoan,
    isFetching: isFetchingLoan,
  } = useQuery({
    queryKey: ["loanDetails", selectedLoan],
    queryFn: async () =>
      (await getLoanDetailsWithSub(selectedLoan)) as LoanDetails,
    enabled: !!selectedLoan,
  });

  if (isLoading || isFetching || isLoadingLoan || isFetchingLoan)
    return <Loader />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-end gap-4">
        <Select onValueChange={setSelectedLoan} value={selectedLoan}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a Loan" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Loans</SelectLabel>
              {loansDDLB?.map((loan) => (
                <SelectItem value={loan.value}>{loan.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {(isLoadingLoan || isFetchingLoan) && <Loader />}
      {loanData && <LoanDash loanData={loanData} showYearlySplits />}
    </div>
  );
};

export default LoansPage;
