import { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownIcon, ArrowUpIcon, EyeOffIcon } from "lucide-react";
import { FaSort } from "react-icons/fa";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  withMenu?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  withMenu = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn("flex flex-row justify-between items-center", className)}
      >
        {title}
      </div>
    );
  }

  if (withMenu) {
    return (
      <div
        className={cn("flex flex-row justify-between items-center", className)}
      >
        {title}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-1 py-0 data-[state=open]:bg-accent"
            >
              {column.getIsSorted() === "desc" ? (
                <ArrowDownIcon className="size-4" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUpIcon className="size-4" />
              ) : (
                <FaSort className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOffIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Hide
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-row justify-between items-center", className)}
    >
      {title}
      <Button
        variant="ghost"
        size="sm"
        className="px-1 py-0"
        onClick={() => column.toggleSorting()}
      >
        {column.getIsSorted() === "desc" ? (
          <ArrowDownIcon className="size-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpIcon className="size-4" />
        ) : (
          <FaSort className="size-4" />
        )}
      </Button>
    </div>
  );
}
