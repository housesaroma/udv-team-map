export type SelectOptionPrimitive = string | number;

export interface SelectOption<TValue extends SelectOptionPrimitive = string> {
  label: string;
  value: TValue;
}

export type TableSortField = "department" | "username" | "position";
export type SortDirection = "asc" | "desc";
export type SortToken = `${TableSortField}_${SortDirection}` | "";
