import { Loan, LoanExtraPayments, LoanRates } from "@prisma/client";

export interface LoanDetails extends Loan {
  loanRates: LoanRates[];
  loanExtraPayments: LoanExtraPayments[];
}
