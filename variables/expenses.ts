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

export const configTanNameOptions: Option[] = [
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
