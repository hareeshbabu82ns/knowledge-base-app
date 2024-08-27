"use client";

import { Loan } from "@prisma/client";
import { LoanForm } from "./loan-form";
import RoiCrud from "./roi-crud";

const LoanDetails = ({ loan }: { loan: Loan }) => {
  return (
    <div className="flex flex-col gap-4">
      <LoanForm
        id={loan.id}
        data={loan}
        type={loan.id === "" ? "create" : "update"}
      />

      {loan.id !== "" && <RoiCrud loanId={loan.id} />}
    </div>
  );
};

export default LoanDetails;
