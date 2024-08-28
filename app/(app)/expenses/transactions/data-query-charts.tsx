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
    <div className="grid grid-cols-2 gap-4 p-3 border-b">
      <ChartAttributeByFrequency
        transactions={data}
        attribute="account"
        frequency="monthly"
      />
      <ChartAttributeByFrequency
        transactions={data}
        attribute="tag"
        frequency="monthly"
      />
      <ChartAttributeByFrequency
        transactions={data}
        attribute="type"
        frequency="monthly"
      />
      {/* <pre>{JSON.stringify(columnFilters, null, 2)}</pre> */}
    </div>
  );
}
