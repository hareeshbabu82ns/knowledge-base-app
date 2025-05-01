import { Badge } from "@/components/ui/badge";
import { ExpenseAccount, ExpenseTransaction } from "@/app/generated/prisma";
import { createColumnHelper } from "@tanstack/react-table";
import { fetchAccounts, fetchTags } from "../accounts/actions";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ExpenseTypeOptions } from "@/variables/expenses";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { ignoreExpenseTransaction, splitExpenseTransaction } from "./actions";
import { toast } from "sonner";
import { TransactionAmountSplitter } from "./transaction-splitter-dlg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ExpenseTransactionWithAccount = ExpenseTransaction & {
  accountObj: ExpenseAccount;
};

const columnHelper =
  createColumnHelper<Partial<ExpenseTransactionWithAccount>>();
export const columns = [
  columnHelper.accessor( "id", {
    id: "id",
    header: "ID",
  } ),
  columnHelper.accessor( "date", {
    id: "date",
    size: 100,
    header: "Date",
    meta: { filterVariant: "dateRange", cellInputVariant: "date" },
    cell: ( info: any ) => (
      <p className="text-sm font-medium">{format( info.getValue(), "PP" )}</p>
    ),
  } ),
  columnHelper.accessor( "description", {
    id: "description",
    header: "Description",
    meta: { filterVariant: "text", cellInputVariant: "text" },
    size: 500,
  } ),
  columnHelper.accessor( "amount", {
    id: "amount",
    size: 50,
    header: "Amount",
    meta: { filterVariant: "range", cellInputVariant: "number" },
    cell: ( { row } ) => {
      const amount = parseFloat( row.getValue( "amount" ) );
      const formatted = new Intl.NumberFormat( "en-CA", {
        minimumFractionDigits: 2,
      } ).format( amount );

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
  } ),
  columnHelper.accessor( "accountObj.name", {
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
        return accounts.map( ( account ) => ( {
          label: account.name,
          value: account.id,
        } ) );
      },
    },
    // cell: (info: any) => info.getValue().name,
  } ),
  columnHelper.accessor( "tags", {
    id: "tags",
    header: "Tags",
    meta: {
      cellInputVariant: "multiSelect",
      filterVariant: "multiSelect",
      fieldType: "array",
      filterOptionsFn: async () => {
        const tags = await fetchTags();
        return tags.map( ( tag ) => ( {
          label: tag.tag,
          value: tag.tag,
        } ) );
      },
    },
    cell: ( info: any ) => (
      <div className="flex flex-row gap-1 text-sm font-medium">
        {info.getValue().map( ( tag: string, i: number ) => (
          <Badge variant="outline" key={`${tag}-${i}`}>
            {tag}
          </Badge>
        ) )}
      </div>
    ),
  } ),
  columnHelper.accessor( "type", {
    id: "type",
    header: "Type",
    meta: {
      cellInputVariant: "select",
      filterVariant: "multiSelect",
      filterOptions: ExpenseTypeOptions,
    },
  } ),
  columnHelper.display( {
    id: "actions",
    header: "Actions",
    size: 50,
    cell: ( { row, table, column } ) => (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <Icons.moreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText( row.original.description || "" )
              }
            >
              <Icons.booking className="mr-2 size-4" />
              <span>Copy Description</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.getCanEdit() && (
              <DropdownMenuItem
                onClick={() => {
                  row.toggleEditing();
                }}
              >
                <Icons.edit className="mr-2 size-4" />
                <span>Edit Transaction</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              disabled={!table.options.meta?.deleteData}
              onClick={() => {
                toast.error( `Delete Transaction? ${row.original.description}`, {
                  id: `expense-transaction-deletion-${row.id}`,
                  duration: Infinity,
                  closeButton: true,
                  action: (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="ml-auto"
                      onClick={() => {
                        row.getIsEditing() && row.toggleEditing();
                        table.options.meta?.deleteData!( {
                          rowId: row.id,
                          rowData: row.original,
                        } );
                        toast.dismiss( row.original.id );
                      }}
                    >
                      <Icons.trash className="size-4" />
                    </Button>
                  ),
                } );
              }}
            >
              <Icons.trash className="mr-2 size-4" />
              <span>Delete Transaction</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.warning(
                  `Move to Ignored List? ${row.original.description}`,
                  {
                    id: `expense-transaction-ignore-${row.id}`,
                    duration: Infinity,
                    closeButton: true,
                    action: (
                      <Button
                        size="icon"
                        className="ml-auto"
                        onClick={async () => {
                          row.getIsEditing() && row.toggleEditing();
                          try {
                            await ignoreExpenseTransaction( row.id );
                            toast.success( "Transaction moved to Ignored List" );
                          } catch ( e ) {
                            console.error( e );
                            toast.error(
                              "Failed to move transaction to Ignored List",
                            );
                          }
                        }}
                      >
                        <Icons.archive className="size-4" />
                      </Button>
                    ),
                  },
                );
              }}
            >
              <Icons.archive className="mr-2 size-4" />
              <span>Archive Transaction</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TransactionAmountSplitter
          row={row}
          onSave={async ( splits: number[] ) => {
            row.getIsEditing() && row.toggleEditing();
            try {
              await splitExpenseTransaction( {
                id: row.id,
                splits: splits.map( ( s ) => ( { amount: s } ) ),
              } );
              toast.success( "Transaction splitted successfully" );
            } catch ( e ) {
              console.error( e );
              toast.error( "Transaction split failed" );
            }
          }}
        />
      </>
    ),
    enableSorting: false,
    enableHiding: false,
  } ),
];
