"use client";

import { Table } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { DataTableFilters } from "./datatable-filters";
import { Icons } from "../shared/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  resetFilters?: () => void;
  refetch?: () => void;
  isFiltersOpen?: boolean;
  debounce?: number;
  onRowEditFormOpen?: (isOpen: boolean) => void;
}

export function DataTableHeader<TData>({
  table,
  title,
  actions,
  className,
  resetFilters,
  refetch,
  isFiltersOpen: _isFiltersOpen,
  debounce = 1000,
  onRowEditFormOpen,
}: DataTableHeaderProps<TData>) {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(_isFiltersOpen);

  React.useEffect(() => {
    setIsFiltersOpen(_isFiltersOpen);
  }, [_isFiltersOpen]);

  return (
    <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} asChild>
      <div className={cn("@container/theader", className)}>
        <div className="@xs/theader:flex-row bg-muted/50 flex h-10 flex-1 flex-col items-center justify-between gap-2 p-2">
          <div>{title}</div>
          <div className="flex items-center gap-2">
            {actions}
            {onRowEditFormOpen && (
              <Button
                onClick={() => onRowEditFormOpen(true)}
                variant="ghost"
                size="icon"
                title="Show Edit Form"
              >
                <Icons.add className="size-4" />
                <span className="sr-only">Show Edit Form</span>
              </Button>
            )}
            {refetch && (
              <Button
                onClick={() => refetch()}
                variant="ghost"
                size="icon"
                title="Refetch Data"
              >
                <Icons.refresh className="size-4" />
                <span className="sr-only">Refetch Data</span>
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-9 p-0"
                title="Toggle Filters"
              >
                <Icons.settingsSliders className="size-4" />
                <span className="sr-only">Toggle Filters</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="space-y-2 border-b-2">
          <DataTableFilters
            table={table}
            resetFilters={resetFilters}
            debounce={debounce}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
