export const EXPENSE_TYPES = ["Income", "Expense", "Ignore"];

export const ACCOUNT_TYPES = [
  "Checking Account",
  "Saving Account",
  "Credit Card",
  "Home Loan",
  "Vehicle Loan",
];

export const EXPENSE_IGNORE_FIELDS = ["description"];
export const EXPENSE_TEXT_ADJUST_SCOPES = ["line"];

export const COMPARISION_OPS_EQ = "EQ";
export const COMPARISION_OPS_NE = "NE";
export const COMPARISION_OPS_GT = "GT";
export const COMPARISION_OPS_LT = "LT";
export const COMPARISION_OPS_STARTS_WITH = "STARTS_WITH";
export const COMPARISION_OPS_CONTAINS = "CONTAINS";
export const COMPARISION_OPS_REGEX = "REGEX";

export const COMPARISION_OPS = [
  COMPARISION_OPS_EQ,
  COMPARISION_OPS_NE,
  COMPARISION_OPS_GT,
  COMPARISION_OPS_LT,
  COMPARISION_OPS_STARTS_WITH,
  COMPARISION_OPS_CONTAINS,
  COMPARISION_OPS_REGEX,
];

export const EXPENSE_FIELDS = ["none", "date", "description", "amount"];
export const EXPENSE_TYPE_COND_EXPENSE_IF_GT_0 = "EXPENSE_IF_GT_0";
export const EXPENSE_TYPE_COND_INCOME_IF_GT_0 = "INCOME_IF_GT_0";
export const EXPENSE_TYPE_COND_INCOME_IF_GT_0_EL_EXPENSE =
  "INCOME_IF_GT_0_EL_EXPENSE";
export const EXPENSE_TYPE_COND_EXPENSE_IF_GT_0_EL_INCOME =
  "EXPENSE_IF_GT_0_EL_INCOME";
export const EXPENSE_TYPE_COND = [
  "",
  EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
  EXPENSE_TYPE_COND_EXPENSE_IF_GT_0_EL_INCOME,
  EXPENSE_TYPE_COND_INCOME_IF_GT_0,
  EXPENSE_TYPE_COND_INCOME_IF_GT_0_EL_EXPENSE,
];

export const INTL_DATE_LONG_OPTIONS = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
};
export const INTL_DATE_SHORT_OPTIONS = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

export const ACCOUNT_CONFIG_FIELD_TYPES = [
  "string",
  "amount",
  "number",
  "date",
  "time",
  "dateTime",
];
