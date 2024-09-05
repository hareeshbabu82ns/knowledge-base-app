import { DataTableBasic } from "@/components/data-table/datatable-basic";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IConfig } from "@/types/expenses";
import { Prisma } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { TransactionFilterDlg } from "./transaction-filter-dlg";

const columnHelper =
  createColumnHelper<Prisma.ExpenseTransactionCreateManyInput>();
export const columns = [
  columnHelper.accessor("date", {
    id: "date",
    size: 120,
    header: "Date",
    meta: { filterVariant: "dateRange" },
    cell: (info: any) => (
      <p className="text-sm font-medium">{format(info.getValue(), "PP")}</p>
    ),
  }),
  columnHelper.accessor("description", {
    id: "description",
    header: "Description",
    meta: { filterVariant: "text" },
  }),
  columnHelper.accessor("amount", {
    id: "amount",
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
  }),
  columnHelper.accessor("tags", {
    id: "tags",
    header: "Tags",
    size: 200,
    meta: {
      filterVariant: "text",
    },
    cell: (info: any) => (
      <div className="no-scrollbar flex max-w-52 flex-row gap-1 overflow-x-scroll text-sm font-medium">
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
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 50,
    cell: ({ row }) => <TransactionFilterDlg rowData={row.original} />,
    enableSorting: false,
  }),
];

interface ComponentProps {
  title: string;
  data: Prisma.ExpenseTransactionCreateManyInput[];
  config: IConfig;
}
const TransactionUploadTable = ({ title, data }: ComponentProps) => {
  return (
    <div>
      <DataTableBasic
        title={title}
        columns={columns as any}
        defaultPagination={{ pageSize: 50, pageIndex: 0 }}
        defaultColumnVisibility={{ type: false }}
        data={data}
      />
      {/* <pre>{JSON.stringify(data.allRecords, null, 2)}</pre> */}
    </div>
  );
};

export default TransactionUploadTable;
