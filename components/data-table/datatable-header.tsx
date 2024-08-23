"use client";

import { Table } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import DebouncedInput from "../DebouncedInput";
import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { ChevronsUpDown } from "lucide-react";
import { DataTableFilters } from "./datatable-filters";
import { Icons } from "../shared/icons";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  resetFilters?: () => void;
  isFiltersOpen?: boolean;
}

export function DataTableHeader<TData>({
  table,
  title,
  actions,
  className,
  resetFilters,
  isFiltersOpen: _isFiltersOpen,
}: DataTableHeaderProps<TData>) {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(_isFiltersOpen);

  React.useEffect(() => {
    setIsFiltersOpen(_isFiltersOpen);
  }, [_isFiltersOpen]);

  return (
    <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} asChild>
      <div className={cn("@container/theader ", className)}>
        <div className="@xs/theader:flex-row bg-muted/50 flex flex-1 flex-col items-center justify-between gap-2 p-2">
          {title}
          <div className="flex items-center gap-2">
            {actions}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <Icons.settingsSliders className="size-4" />
                <span className="sr-only">Toggle Filters</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="space-y-2 border-b-2">
          <DataTableFilters table={table} resetFilters={resetFilters} />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
