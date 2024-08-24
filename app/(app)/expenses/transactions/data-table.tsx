"use client";
import { DataTableGeneric } from "@/components/data-table/datatable-generic";
import { columns } from "./columns";
import { subMonths } from "date-fns";
import React from "react";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/components/data-table/datatable-filters";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "./actions";

export function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "date", value: [subMonths(new Date(), 6), undefined] },
  ]);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
      type: false,
    });

  const { data, refetch, isFetching, isLoading } = useQuery({
    queryKey: ["transactions", pagination, sorting, columnFilters],
    queryFn: () =>
      fetchTransactions({ pagination, sorting, filters: columnFilters }),
    placeholderData: keepPreviousData,
  });

  if (isFetching || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DataTableGeneric
      title="Transactions"
      data={data?.rows!}
      rowCount={data?.rowCount}
      columns={columns as any}
      sorting={sorting}
      onSortingChange={setSorting}
      pagination={pagination}
      onPaginationChange={setPagination}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      resetFilters={() => {
        setColumnFilters([
          { id: "date", value: [subMonths(new Date(), 6), undefined] },
        ]);
        setSorting([{ id: "date", desc: true }]);
        setPagination({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
        });
        setColumnVisibility({
          id: false,
          type: false,
        });
      }}
    />
  );
}

// import {
//   ColumnDef,
//   ColumnFiltersState,
//   flexRender,
//   getCoreRowModel,
//   PaginationState,
//   SortingState,
//   useReactTable,
//   VisibilityState,
// } from "@tanstack/react-table";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import React, { useCallback, useMemo, useState } from "react";
// import { DataTablePagination } from "@/components/data-table/datatable-pagination";
// import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import { fetchTransactions } from "./actions";
// import { subMonths } from "date-fns";
// import { DataTableHeader } from "@/components/data-table/datatable-header";
// import { DataTableColumnHeader } from "@/components/data-table/datatable-column-header";
// import {
//   DEFAULT_PAGE_INDEX,
//   DEFAULT_PAGE_SIZE,
// } from "@/components/data-table/datatable-filters";

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
// }

// export function DataTable<TData, TValue>({
//   columns,
// }: DataTableProps<TData, TValue>) {
//   const [sorting, setSorting] = React.useState<SortingState>([
//     { id: "date", desc: true },
//   ]);

//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
//     { id: "date", value: [subMonths(new Date(), 6), undefined] },
//   ]);

//   const [pagination, setPagination] = React.useState<PaginationState>({
//     pageIndex: DEFAULT_PAGE_INDEX,
//     pageSize: DEFAULT_PAGE_SIZE,
//   });

//   const dataQuery = useQuery({
//     queryKey: ["transactions", pagination, sorting, columnFilters],
//     queryFn: () =>
//       fetchTransactions({ pagination, sorting, filters: columnFilters }),
//     placeholderData: keepPreviousData,
//   });

//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
//     id: false,
//     type: false,
//   });

//   const defaultData = useMemo(() => [], []);
//   const resetFilters = useCallback(() => {
//     setColumnFilters([
//       { id: "date", value: [subMonths(new Date(), 6), undefined] },
//     ]);
//     setSorting([{ id: "date", desc: true }]);
//     setPagination({
//       pageIndex: DEFAULT_PAGE_INDEX,
//       pageSize: DEFAULT_PAGE_SIZE,
//     });
//     setColumnVisibility({
//       id: false,
//       type: false,
//     });
//   }, []);

//   const table = useReactTable({
//     data: (dataQuery.data?.rows as TData[]) ?? defaultData,
//     rowCount: dataQuery.data?.rowCount,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     state: {
//       sorting,
//       pagination,
//       columnFilters,
//       columnVisibility,
//     },
//     onSortingChange: setSorting,
//     onPaginationChange: setPagination,
//     onColumnFiltersChange: setColumnFilters,
//     manualPagination: true,
//     manualSorting: true,
//     manualFiltering: true,
//   });

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="rounded-md border">
//         <DataTableHeader
//           table={table}
//           title="Transactions"
//           resetFilters={resetFilters}
//           isFiltersOpen={true}
//         />
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <DataTableColumnHeader key={header.id} header={header} />
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell
//                       key={cell.id}
//                       className="hover:bg-black/5 dark:hover:bg-white/5"
//                     >
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext(),
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//         <DataTablePagination table={table} />
//       </div>
//     </div>
//   );
// }
