import { Loan, LoanExtraPayments, LoanRates } from "@/app/generated/prisma";

export interface LoanDetails extends Loan {
  loanRates: LoanRates[];
  loanExtraPayments: LoanExtraPayments[];
}
