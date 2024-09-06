import { Badge } from "@/components/ui/badge";
import { ExpenseAccount, ExpenseTransaction } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";
import { fetchAccounts, fetchTags } from "../accounts/actions";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ExpenseTypeOptions } from "@/variables/expenses";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";

export type ExpenseTransactionWithAccount = ExpenseTransaction & {
  accountObj: ExpenseAccount;
};

const columnHelper =
  createColumnHelper<Partial<ExpenseTransactionWithAccount>>();
export const columns = [
  columnHelper.accessor("id", {
    id: "id",
    header: "ID",
  }),
  columnHelper.accessor("date", {
    id: "date",
    size: 100,
    header: "Date",
    meta: { filterVariant: "dateRange", cellInputVariant: "date" },
    cell: (info: any) => (
      <p className="text-sm font-medium">{format(info.getValue(), "PP")}</p>
    ),
  }),
  columnHelper.accessor("description", {
    id: "description",
    header: "Description",
    meta: { filterVariant: "text", cellInputVariant: "text" },
    size: 500,
  }),
  columnHelper.accessor("amount", {
    id: "amount",
    size: 50,
    header: "Amount",
    meta: { filterVariant: "range", cellInputVariant: "number" },
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
  }),
  columnHelper.accessor("accountObj.name", {
    id: "accountObj",
    header: "Account",
    size: 50,
    // enableSorting: false,
    meta: {
      dbMapId: "account",
      cellInputVariant: "select",
      filterVariant: "multiSelect",
      fieldType: "subObject",
      subObjectLabelField: "name",
      filterOptionsFn: async () => {
        const accounts = await fetchAccounts();
        return accounts.map((account) => ({
          label: account.name,
          value: account.id,
        }));
      },
    },
    // cell: (info: any) => info.getValue().name,
  }),
  columnHelper.accessor("tags", {
    id: "tags",
    header: "Tags",
    meta: {
      cellInputVariant: "multiSelect",
      filterVariant: "multiSelect",
      fieldType: "array",
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
  }),
  columnHelper.accessor("type", {
    id: "type",
    header: "Type",
    meta: {
      cellInputVariant: "select",
      filterVariant: "multiSelect",
      filterOptions: ExpenseTypeOptions,
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 50,
    cell: ({ row, table, column }) => (
      <div className="flex flex-row gap-1">
        {row.getIsEditing() && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              row.toggleEditing();
            }}
          >
            <Icons.close className="size-4" />
          </Button>
        )}
        {row.getCanEdit() && !row.getIsEditing() && (
          <Button
            variant="ghost"
            className="text-destructive size-8 p-2"
            disabled={row.getIsEditing()}
            onClick={() => {
              row.toggleEditing();
            }}
          >
            <Icons.edit className="size-4" />
          </Button>
        )}
        <DeleteConfirmButton
          variant="ghost"
          className="text-destructive size-8 p-2"
          disabled={!table.options.meta?.deleteData}
          toastId={`config-file-fields-deletion-${row.id}`}
          toastLabel={`Delete Input Field Config? ${row.original.description}`}
          onClick={() =>
            table.options.meta?.deleteData!({
              rowId: row.id,
              rowData: row.original,
            })
          }
        >
          <Icons.trash className="size-8" />
        </DeleteConfirmButton>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }),
];
