import React from "react";
import { calculateEMI, sampleEMISplits } from "../utils";
import { DataTableBasic } from "@/components/data-table/datatable-basic";
import { columns, columnsYear } from "./columns";
import { SortingState } from "@tanstack/react-table";
import { ScheduleYearsBarChart } from "../_components/schedule-years-bars";
import { ScheduleYearsPieChart } from "../_components/schedule-stats-pie";

const defaultSorting: SortingState = [{ id: "date", desc: true }];
const defaultYearSorting: SortingState = [{ id: "year", desc: false }];

const LoansPage = () => {
  const calc = React.useMemo(() => sampleEMISplits(), []);
  const calcWithoutExtras = React.useMemo(
    () => sampleEMISplits({ withExtraPayments: false }),
    [],
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <ScheduleYearsBarChart
          title="Loan"
          data={calcWithoutExtras.scheduleYear}
        />
        <ScheduleYearsBarChart title="Loan (Extras)" data={calc.scheduleYear} />
        <ScheduleYearsPieChart data={calcWithoutExtras.scheduleYear} />
        <ScheduleYearsPieChart data={calc.scheduleYear} />
      </div>
      <div className="flex flex-col gap-4">
        <DataTableBasic
          title="Loan Payments Yearly"
          data={calc.scheduleYear}
          columns={columnsYear}
          defaultSorting={defaultYearSorting}
        />
        <DataTableBasic
          title="Loan Payments"
          data={calc.schedule}
          columns={columns}
          defaultSorting={defaultSorting}
        />
        {/* <div>{JSON.stringify(calc)}</div> */}
      </div>
    </div>
  );
};

export default LoansPage;
