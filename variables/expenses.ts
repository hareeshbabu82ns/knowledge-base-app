import { Option } from "@/components/ui/multi-select";

export type ACCOUNT_TYPE =
  | "Checking Account"
  | "Saving Account"
  | "Credit Card"
  | "Home Loan"
  | "Vehicle Loan";

export const accountTypes = [
  {
    name: "Checking Account",
  },
  {
    name: "Saving Account",
  },
  {
    name: "Credit Card",
  },
  {
    name: "Home Loan",
  },
  {
    name: "Vehicle Loan",
  },
];

export const configFieldExpenseTypeOptions: Option[] = [
  { label: "Exp >0", value: "EXPENSE_IF_GT_0" },
  { label: "Exp >0< Inc", value: "EXPENSE_IF_GT_0_EL_INCOME" },
  { label: "Inc >0", value: "INCOME_IF_GT_0" },
  { label: "Inc >0< Exp", value: "INCOME_IF_GT_0_EL_EXPENSE" },
];

export const configFieldExpenseColumnOptions: Option[] = [
  { label: "None", value: "none" },
  { label: "Date", value: "date" },
  { label: "Description", value: "description" },
];

export const configFieldTypeOptions: Option[] = [
  { label: "String", value: "string" },
  { label: "Amount", value: "amount" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "Time", value: "time" },
  { label: "DateTime", value: "dateTime" },
];

export const configTagNameOptions: Option[] = [
  { label: "Description", value: "description" },
];

export const configComparisionOptions: Option[] = [
  {
    label: "Equals",
    value: "EQ",
  },
  {
    label: "Not Equals",
    value: "NE",
  },
  {
    label: "Greater Than",
    value: "GT",
  },
  {
    label: "Greater Than or Equal",
    value: "GE",
  },
  {
    label: "Less Than",
    value: "LT",
  },
  {
    label: "Less Than or Equal",
    value: "LE",
  },
  {
    label: "Contains",
    value: "CONTAINS",
  },
  {
    label: "Not Contains",
    value: "NOT_CONTAINS",
  },
  {
    label: "Starts With",
    value: "STARTS_WITH",
  },
  {
    label: "Not Starts With",
    value: "NOT_STARTS_WITH",
  },
  {
    label: "Ends With",
    value: "ENDS_WITH",
  },
  {
    label: "Not Ends With",
    value: "NOT_ENDS_WITH",
  },
];
