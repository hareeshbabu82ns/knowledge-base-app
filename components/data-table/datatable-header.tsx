"use client";
import { Table } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import DebouncedInput from "../DebouncedInput";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  showGoToPage?: boolean;
  className?: string;
}

export function DataTableHeader<TData>({
  table,
  title,
  actions,
  showGoToPage = false,
  className,
}: DataTableHeaderProps<TData>) {
  return (
    <div
      className={cn(
        "@container/theader bg-muted/50 flex flex-1 items-center justify-between p-2 font-medium",
        className,
      )}
    >
      <div className="@xs/theader:flex-row flex flex-1 flex-col items-center justify-between gap-2">
        {title}
        <div className="flex items-center gap-2">
          {actions}
          {showGoToPage && (
            <DebouncedInput
              className="w-14"
              type="text"
              inputMode="numeric"
              placeholder="Go to page"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(value) => {
                const page = value ? Number(value) - 1 : 0;
                table.setPageIndex(page);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
