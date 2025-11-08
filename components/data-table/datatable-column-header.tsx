"use client";

import { flexRender, Header } from "@tanstack/react-table";
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { FaSort } from "react-icons/fa";
import DataTableColumnFilter from "./datatable-column-filter";
import { TableHead } from "../ui/table";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  header: Header<TData, TValue>;
  withFilter?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  header,
  className,
  withFilter = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const canSort = header.column.getCanSort();
  const canFilter = header.column.getCanFilter();
  const sortDirection = header.column.getIsSorted();
  const headerSize = header.getSize();

  // Memoize sort icon
  const sortIcon = React.useMemo(() => {
    if (sortDirection === "asc") {
      return <ArrowUpIcon className="size-4" aria-label="Sorted ascending" />;
    } else if (sortDirection === "desc") {
      return (
        <ArrowDownIcon className="size-4" aria-label="Sorted descending" />
      );
    } else if (canSort) {
      return <FaSort className="size-4" aria-label="Sort" />;
    }
    return null;
  }, [sortDirection, canSort]);

  // Memoize sort handler
  const handleSort = React.useCallback(() => {
    if (canSort) {
      header.column.getToggleSortingHandler()?.({} as any);
    }
  }, [canSort, header.column]);

  return (
    <TableHead
      key={header.id}
      colSpan={header.colSpan}
      className={cn(
        "h-auto hover:bg-black/5 dark:hover:bg-white/5",
        withFilter && canSort ? "pb-2" : "",
        headerSize !== 150 ? `w-[${headerSize}px]` : "",
        className,
      )}
    >
      {header.isPlaceholder ? null : (
        <>
          <div
            className={cn(
              "flex flex-row items-center justify-between py-2",
              canSort ? "cursor-pointer select-none" : "",
            )}
            onClick={handleSort}
            onKeyDown={(e) => {
              if (canSort && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleSort();
              }
            }}
            role={canSort ? "button" : undefined}
            tabIndex={canSort ? 0 : undefined}
            aria-sort={
              sortDirection === "asc"
                ? "ascending"
                : sortDirection === "desc"
                  ? "descending"
                  : undefined
            }
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {sortIcon}
          </div>
          {withFilter && canFilter ? (
            <DataTableColumnFilter column={header.column} />
          ) : null}
        </>
      )}
    </TableHead>
  );
}
