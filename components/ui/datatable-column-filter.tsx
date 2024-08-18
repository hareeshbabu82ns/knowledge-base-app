import { Column } from "@tanstack/react-table";
import DebouncedInput from "../DebouncedInput";
import { useQuery } from "@tanstack/react-query";

function generateFilterOptions(filterOptions?: Map<string, string> | string[]) {
  if (!filterOptions) return null;

  if (Array.isArray(filterOptions)) {
    return filterOptions.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ));
  }

  return Array.from(filterOptions).map(([key, value]) => (
    <option key={key} value={key}>
      {value}
    </option>
  ));
}

export default function DataTableColumnFilter({
  column,
}: {
  column: Column<any, unknown>;
}) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, filterOptions, filterOptionsFn } =
    column.columnDef.meta ?? {};

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["filters", column.id],
    queryFn: async () => {
      if (filterOptionsFn) {
        return await filterOptionsFn();
      } else if (filterOptions) {
        return filterOptions;
      } else {
        return [];
      }
    },
  });

  return filterVariant === "range" ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      {generateFilterOptions(data)}
    </select>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
    // See faceted column filters example for datalist search suggestions
  );
}
