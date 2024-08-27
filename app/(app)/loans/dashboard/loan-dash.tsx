import React from "react";
import { calculateEMISplits } from "../utils";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import { columns, columnsYear } from "./columns";
import { SortingState } from "@tanstack/react-table";
import { ScheduleYearsBarChart } from "../_components/schedule-years-bars";
import { ScheduleYearsPieChart } from "../_components/schedule-stats-pie";
import { LoanDetails } from "@/types/loans";

const defaultSorting: SortingState = [{ id: "date", desc: true }];
const defaultYearSorting: SortingState = [{ id: "year", desc: false }];

const calculateSplits = ({
  loanData,
  withExtraPayments = false,
}: {
  loanData: LoanDetails;
  withExtraPayments?: boolean;
}) => {
  const schedule = calculateEMISplits({
    principal: loanData.amount,
    annualInterestRate: loanData.interestRate,
    loanTermMonths: loanData.durationMonths,
    paymentFrequency: loanData.frequency,
    startDate: loanData.startDate,
    emiPaid: loanData.emi,
    extraPayments: withExtraPayments ? loanData.loanExtraPayments : [],
    interestRateChanges: loanData.loanRates,
  });
  return schedule;
};

const LoanDash = ({
  loanData,
  showAllSplits = false,
  showYearlySplits = false,
}: {
  loanData: LoanDetails;
  showYearlySplits?: boolean;
  showAllSplits?: boolean;
}) => {
  const calc = React.useMemo(() => calculateSplits({ loanData }), [loanData]);
  const calcWithoutExtras = React.useMemo(
    () => calculateSplits({ loanData, withExtraPayments: false }),
    [loanData],
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <ScheduleYearsBarChart
          title={loanData.name}
          data={calcWithoutExtras.scheduleYear}
        />
        <ScheduleYearsBarChart
          title={`${loanData.name} (Extras)`}
          data={calc.scheduleYear}
        />
        <ScheduleYearsPieChart data={calcWithoutExtras.scheduleYear} />
        <ScheduleYearsPieChart data={calc.scheduleYear} />
      </div>
      <div className="flex flex-col gap-4">
        {showYearlySplits && (
          <DataTableBasic
            title="Loan Payments Yearly"
            data={calc.scheduleYear}
            columns={columnsYear}
            defaultSorting={defaultYearSorting}
          />
        )}
        {showAllSplits && (
          <DataTableBasic
            title="Loan Payments"
            data={calc.schedule}
            columns={columns}
            defaultSorting={defaultSorting}
          />
        )}
        {/* <div>{JSON.stringify(calc)}</div> */}
      </div>
    </div>
  );
};

export default LoanDash;
