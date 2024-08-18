"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/datatable-column-header";
import { ExpenseTransaction, Prisma } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { fetchAccounts, fetchTags } from "../accounts/actions";

export const columns: ColumnDef<Partial<ExpenseTransaction>>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" sortOnly />
    ),
    cell: (info: any) => (
      <p className="text-sm font-medium">
        {info.getValue().toLocaleDateString()}
      </p>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    filterFn: "includesString",
    meta: { filterVariant: "text" },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    meta: { filterVariant: "range" },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-CA").format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "accountObj",
    header: "Account",
    meta: {
      filterVariant: "select",
      filterOptionsFn: async () => {
        const accounts = await fetchAccounts();
        const acc = new Map();
        acc.set("", "Select an account");
        accounts.forEach((account) => {
          acc.set(account.id, account.name);
        });
        return acc;
      },
    },
    cell: (info: any) => info.getValue().name,
    // cell: ({ row }) => row.original?.accountObj?.name,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    meta: {
      filterVariant: "select",
      filterOptionsFn: async () => {
        const tags = await fetchTags();
        const acc = new Map();
        acc.set("", "Select an tag");
        tags.forEach((tag) => {
          acc.set(tag.tag, tag.tag);
        });
        return acc;
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
