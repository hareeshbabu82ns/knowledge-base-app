import { ColumnDef, ColumnFilter, SortingState } from "@tanstack/react-table";
import { Option } from "../ui/multi-select";

/**
 * Filter function for multi-select columns
 * @param row - Table row
 * @param columnId - Column identifier
 * @param filterValue - Array of selected options
 * @returns boolean indicating if row matches filter
 */
export const filterFnMultiSelect = <TData = any>(
  row: { original: TData },
  columnId: string,
  filterValue: Option[],
): boolean => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;

  const value = (row.original as any)[columnId] as string | undefined;
  if (!value) return false;

  return filterValue.some((option) => option.value === value);
};

/**
 * Filter function for date range columns
 * @param row - Table row
 * @param columnId - Column identifier
 * @param filterValue - Tuple of start and end dates
 * @returns boolean indicating if row matches filter
 */
export const filterFnDateRange = <TData = any>(
  row: { original: TData },
  columnId: string,
  filterValue: [Date | undefined, Date | undefined],
): boolean => {
  const value = (row.original as any)[columnId] as Date | string | undefined;
  if (!value) return false;

  const dateValue = value instanceof Date ? value : new Date(value);
  if (isNaN(dateValue.getTime())) return false;

  const [startDate, endDate] = filterValue;

  if (startDate && dateValue < new Date(startDate)) return false;
  if (endDate && dateValue > new Date(endDate)) return false;

  return true;
};

/**
 * Converts TanStack Table sorting state to Prisma orderBy format
 * @param sorting - TanStack Table sorting state
 * @param columns - Column definitions
 * @returns Prisma orderBy object
 * @example
 * // Input: [{ id: 'date', desc: true }]
 * // Output: { date: 'desc' }
 */
export const convertSortingToPrisma = (
  sorting: SortingState,
  columns: ColumnDef<any, any>[],
): Record<string, "asc" | "desc" | Record<string, "asc" | "desc">> => {
  if (!Array.isArray(sorting) || sorting.length === 0) {
    return {};
  }

  return sorting.reduce(
    (acc, { id, desc }) => {
      const column = columns.find((c) => c.id === id);
      if (!column) {
        console.warn(`Column with id "${id}" not found in column definitions`);
        return acc;
      }

      const dbId = column?.meta?.dbMapId || id;
      const sortOrder = desc ? "desc" : "asc";

      if (
        column?.meta?.fieldType === "subObject" &&
        column?.meta?.subObjectLabelField
      ) {
        acc[dbId] = {
          [column.meta.subObjectLabelField]: sortOrder,
        };
      } else {
        acc[dbId] = sortOrder;
      }
      return acc;
    },
    {} as Record<string, "asc" | "desc" | Record<string, "asc" | "desc">>,
  );
};

/**
 * Converts TanStack Table column filters to Prisma where clause format
 * @param filters - TanStack Table column filters
 * @param columns - Column definitions
 * @returns Prisma where clause object
 * @example
 * // Input: [{ id: 'description', value: 'test' }]
 * // Output: { description: { contains: 'test', mode: 'insensitive' } }
 */
export const convertColumnFiltersToPrisma = (
  filters: ColumnFilter[],
  columns: ColumnDef<any, any>[],
): Record<string, any> => {
  if (!Array.isArray(filters) || filters.length === 0) {
    return {};
  }

  return filters.reduce(
    (acc, { id, value }) => {
      // Skip empty or undefined values
      if (value === undefined || value === null || value === "") {
        return acc;
      }

      const column = columns.find((c) => c.id === id);
      if (!column) {
        console.warn(`Column with id "${id}" not found in column definitions`);
        return acc;
      }

      const dbId = column?.meta?.dbMapId || id;
      const filterVariant = column?.meta?.filterVariant;

      try {
        switch (filterVariant) {
          case "dateRange": {
            const arrVal = value as [
              Date | string | undefined,
              Date | string | undefined,
            ];
            if (!arrVal || (!arrVal[0] && !arrVal[1])) break;

            acc[dbId] = {};
            if (arrVal[0]) {
              acc[dbId].gte = new Date(arrVal[0]);
            }
            if (arrVal[1]) {
              acc[dbId].lte = new Date(arrVal[1]);
            }
            break;
          }
          case "range": {
            const arrVal = value as [
              number | string | undefined,
              number | string | undefined,
            ];
            if (!arrVal || (!arrVal[0] && !arrVal[1])) break;

            acc[dbId] = {};
            if (arrVal[0]) {
              const minVal = Number(arrVal[0]);
              if (!isNaN(minVal)) {
                acc[dbId].gte = minVal;
              }
            }
            if (arrVal[1]) {
              const maxVal = Number(arrVal[1]);
              if (!isNaN(maxVal)) {
                acc[dbId].lte = maxVal;
              }
            }
            break;
          }
          case "select": {
            acc[dbId] = { equals: value };
            break;
          }
          case "multiSelect": {
            const options = value as Option[];
            if (!Array.isArray(options) || options.length === 0) break;

            const values = options.map((o) => o.value).filter(Boolean);
            if (values.length === 0) break;

            acc[dbId] =
              column?.meta?.fieldType === "array"
                ? { hasSome: values }
                : { in: values };
            break;
          }
          case "text": {
            acc[dbId] = { contains: String(value), mode: "insensitive" };
            break;
          }
          default: {
            // Default to case-insensitive contains search
            if (typeof value === "string") {
              acc[dbId] = { contains: value, mode: "insensitive" };
            } else {
              acc[dbId] = { equals: value };
            }
            break;
          }
        }
      } catch (error) {
        console.error(`Error processing filter for column "${id}":`, error);
      }

      return acc;
    },
    {} as Record<string, any>,
  );
};
