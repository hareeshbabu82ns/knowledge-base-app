"use client";

import { Badge } from "@/components/ui/badge";
import { ExpenseTransaction } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { fetchAccounts, fetchTags } from "../accounts/actions";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<Partial<ExpenseTransaction>>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "date",
    size: 100,
    header: "Date",
    meta: { filterVariant: "dateRange" },
    cell: (info: any) => (
      <p className="text-sm font-medium">
        {info.getValue().toLocaleDateString()}
      </p>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    meta: { filterVariant: "text" },
    size: 500,
  },
  {
    accessorKey: "amount",
    size: 50,
    header: "Amount",
    meta: { filterVariant: "range" },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-CA", {
        minimumFractionDigits: 2,
      }).format(amount);

      return (
        <div
          className={cn(
            "text-right text-lg font-bold tracking-wider",
            row.original.type === "Expense"
              ? "text-red-700 dark:text-red-500"
              : "text-green-700 dark:text-green-500",
          )}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "accountObj",
    header: "Account",
    size: 50,
    // enableSorting: false,
    meta: {
      filterVariant: "multiSelect",
      filterOptionsFn: async () => {
        const accounts = await fetchAccounts();
        return accounts.map((account) => ({
          label: account.name,
          value: account.id,
        }));
      },
    },
    cell: (info: any) => info.getValue().name,
    // cell: ({ row }) => row.original?.accountObj?.name,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    meta: {
      filterVariant: "multiSelect",
      filterOptionsFn: async () => {
        const tags = await fetchTags();
        return tags.map((tag) => ({
          label: tag.tag,
          value: tag.tag,
        }));
      },
    },
    cell: (info: any) => (
      <div className="flex flex-row gap-1 text-sm font-medium">
        {info.getValue().map((tag: string, i: number) => (
          <Badge variant="outline" key={`${tag}-${i}`}>
            {tag}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
];
