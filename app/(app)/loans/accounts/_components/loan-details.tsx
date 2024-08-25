"use client";

import { Loan } from "@prisma/client";
import { LoanForm } from "./loan-form";

const LoanDetails = ({ loan }: { loan: Loan }) => {
  return (
    <div>
      <LoanForm
        id={loan.id}
        data={loan}
        type={loan.id === "" ? "create" : "update"}
      />
    </div>
  );
};

export default LoanDetails;
