"use client";

import { ColumnFiltersState } from "@tanstack/react-table";
import React from "react";
import { ChartAttributeByFrequency } from "./chart-attr-by-frequency";
import { useQuery } from "@tanstack/react-query";
import { fetchTransactionStats } from "./actions";
import Loader from "@/components/shared/loader";

interface DataQueryChartsProps {
  columnFilters: ColumnFiltersState;
}

export function DataQueryCharts({ columnFilters }: DataQueryChartsProps) {
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["fetchTransactionStats", columnFilters],
    queryFn: () => fetchTransactionStats({ filters: columnFilters }),
  });
  if (isFetching || isLoading) return <Loader />;

  return (
    <div className="grid grid-cols-2 gap-4 border-b p-3">
      <ChartAttributeByFrequency
        key="tagsMonthly"
        transactions={data}
        attribute="tag"
        frequency="monthly"
        className="col-span-2"
      />
      <ChartAttributeByFrequency
        key="accountsMonthly"
        transactions={data}
        attribute="account"
        frequency="monthly"
      />
      <ChartAttributeByFrequency
        key="typesMonthly"
        transactions={data}
        attribute="type"
        frequency="monthly"
      />
      {/* <pre>{JSON.stringify(columnFilters, null, 2)}</pre> */}
    </div>
  );
}
