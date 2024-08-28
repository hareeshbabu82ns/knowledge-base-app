"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { PaymentSchedule, PaymentScheduleYear } from "../utils";
import { formatCurrency } from "@/lib/utils";
import { filterFnDateRange } from "@/components/data-table/utils";
import { format } from "date-fns";

const columnHelper = createColumnHelper<PaymentSchedule>();

export const columns = [
  columnHelper.accessor("paymentDate", {
    id: "date",
    header: "Date",
    cell: (info: any) => (
      <p className="text-sm font-medium">{format(info.getValue(), "PP")}</p>
    ),
    filterFn: filterFnDateRange,
    meta: {
      filterVariant: "dateRange",
    },
  }),
  columnHelper.accessor("paymentAmount", {
    id: "paymentAmount",
    header: "Payment",
    cell: (info: any) => <p className="">{formatCurrency(info.getValue())}</p>,
    meta: {
      filterVariant: "range",
    },
  }),
  columnHelper.accessor("principalPaid", {
    id: "principalPaid",
    header: "Principal",
    enableColumnFilter: false,
    cell: (info: any) => <p className="">{formatCurrency(info.getValue())}</p>,
  }),
  columnHelper.accessor("interestPaid", {
    id: "interestPaid",
    header: "Interest",
    enableColumnFilter: false,
    cell: (info: any) => <p className="">{formatCurrency(info.getValue())}</p>,
  }),
  columnHelper.accessor("remainingBalance", {
    id: "remainingBalance",
    header: "Remaining",
    enableColumnFilter: false,
    cell: (info: any) => <p className="">{formatCurrency(info.getValue())}</p>,
  }),
];

const columnYearHelper = createColumnHelper<PaymentScheduleYear>();

export const columnsYear = [
  columnYearHelper.accessor("year", {
    id: "year",
    header: "Year",
    meta: {
      filterVariant: "range",
    },
  }),
  columnYearHelper.accessor("paymentAmount", {
    id: "paymentAmount",
    header: "Payment",
    cell: (info: any) => <p className="">{formatCurrency(info.getValue())}</p>,
    meta: {
      filterVariant: "range",
    },
  }),
  columnYearHelper.accessor("principalPaid", {
    id: "principalPaid",
    header: "Principal",
    enableColumnFilter: false,
    cell: (info: any) => <p className="">{formatCurrency(info.getValue())}</p>,
  }),
  columnYearHelper.accessor("interestPaid", {
    id: "interestPaid",
    header: "Interest",
    enableColumnFilter: false,
    cell: (info: any) => <p className="">{formatCurrency(info.getValue())}</p>,
  }),
  columnYearHelper.accessor("remainingBalance", {
    id: "remainingBalance",
    header: "Remaining",
    enableColumnFilter: false,
    cell: (info: any) => <p className="">{formatCurrency(info.getValue())}</p>,
  }),
];
