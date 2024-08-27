"use client";

import { Loan } from "@prisma/client";
import { LoanForm } from "./loan-form";
import RoiTable from "./roi-table";
import ExtraPaymentsTable from "./extra-payments-table";

const LoanDetails = ({ loan }: { loan: Loan }) => {
  return (
    <div className="flex flex-col gap-4">
      <LoanForm
        id={loan.id}
        data={loan}
        type={loan.id === "" ? "create" : "update"}
      />

      {loan.id !== "" && <RoiTable loanId={loan.id} />}
      {loan.id !== "" && <ExtraPaymentsTable loanId={loan.id} />}
    </div>
  );
};

export default LoanDetails;
