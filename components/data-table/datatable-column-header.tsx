"use client";

import { flexRender, Header } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { FaSort } from "react-icons/fa";
import DataTableColumnFilter from "./datatable-column-filter";
import { TableHead } from "../ui/table";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  header: Header<TData, TValue>;
  withMenu?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  header,
  className,
  withMenu = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  // const fieldMeta = header.column.columnDef.meta;
  return (
    <TableHead
      key={header.id}
      colSpan={header.colSpan}
      className={cn(header.column.getCanSort() ? "pb-2" : "", className)}
    >
      {header.isPlaceholder ? null : (
        <>
          <div
            {...{
              className: cn(
                "flex flex-row items-center justify-between py-2",
                header.column.getCanSort() ? "cursor-pointer select-none" : "",
              ),
              onClick: header.column.getToggleSortingHandler(),
            }}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {{
              asc: <ArrowUpIcon className="size-4" />,
              desc: <ArrowDownIcon className="size-4" />,
              false: <FaSort className="size-4" />,
            }[header.column.getIsSorted() as string] ?? null}
          </div>
          {header.column.getCanFilter() ? (
            <DataTableColumnFilter column={header.column} />
          ) : null}
        </>
      )}
    </TableHead>
  );
}
