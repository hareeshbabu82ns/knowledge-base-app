"use client";

import { DataTableQuery } from "@/components/data-table/datatable-query";
import { columns } from "./columns";
import { fetchTransactions } from "./actions";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { subMonths } from "date-fns";
import { DataQueryCharts } from "./data-query-charts";

const defaultSorting: SortingState = [{ id: "date", desc: true }];
const defaultColumnVisibility: VisibilityState = {
  id: false,
  type: false,
};
const defaultColumnFilters: ColumnFiltersState = [
  { id: "date", value: [subMonths(new Date(), 6), undefined] },
];

export function DataTable() {
  return (
    <div className="flex flex-col gap-4">
      <DataTableQuery
        title="Transactions"
        columns={columns}
        queryKey="transactions"
        queryFn={fetchTransactions}
        defaultSorting={defaultSorting}
        defaultColumnVisibility={defaultColumnVisibility}
        defaultColumnFilters={defaultColumnFilters}
        isFiltersOpen={true}
        beforeTable={({ table }: any) => (
          <DataQueryCharts columnFilters={table?.getState().columnFilters} />
        )}
      />
    </div>
  );
}
