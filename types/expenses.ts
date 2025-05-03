import { z } from "zod";

// export enum ConfigComparisionEnum {
//   EQUALS = "EQ",
//   NOT_EQUALS = "NE",
//   GREATER_THAN = "GT",
//   GREATER_THAN_OR_EQUAL = "GE",
//   LESS_THAN = "LT",
//   LESS_THAN_OR_EQUAL = "LE",
//   CONTAINS = "CONTAINS",
//   NOT_CONTAINS = "NOT_CONTAINS",
//   STARTS_WITH = "STARTS_WITH",
//   NOT_STARTS_WITH = "NOT_STARTS_WITH",
//   ENDS_WITH = "ENDS_WITH",
//   NOT_ENDS_WITH = "NOT_ENDS_WITH",
// }

export type ConfigComparisionEnum =
  | "EQ"
  | "NE"
  | "GT"
  | "GE"
  | "LT"
  | "LE"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "STARTS_WITH"
  | "NOT_STARTS_WITH"
  | "ENDS_WITH"
  | "NOT_ENDS_WITH"
  | "REGEX";

export type ConfigTextAdjustScope = "line";

export interface IConfigText {
  scope: ConfigTextAdjustScope;
  source: string;
  replaceWith: string;
}

export interface IConfigIgnoreOptions {
  name: string;
  comparision: ConfigComparisionEnum;
  value: string;
}

export interface IConfigTagOptions {
  name: string;
  comparision: ConfigComparisionEnum;
  value: string;
  tags: string[];
}

export interface IConfigFileFields {
  name: string;
  type: string;
  format: string;
  negated: boolean;
  ignore: boolean;
  timeColumnIndex: number;
  expenseColumn: string;
  expenseType: string;
}

export interface IConfig {
  headerLines: number;
  separator: string;
  trimQuotes: boolean;
  textToAdjust?: IConfigText[];
  ignoreOps?: IConfigIgnoreOptions[];
  tagOps?: IConfigTagOptions[];
  fileFields: IConfigFileFields[];
}

export interface IExpTransStatsEntry {
  date: Date;
  account?: string;
  type?: string;
  tag?: string;
  amount: number;
}

export interface IExpTransByAttrStats {
  [key: string]: IExpTransStatsEntry[];
}

// for (single) line, bar, pie charts
export interface IExpTransAmountByAttrStats {
  attr: string;
  amount: number;
  fill?: string;
}
export interface IExpTransAmountByAttrStatsArray {
  [key: string]: IExpTransAmountByAttrStats[];
}

export const TagSchema = z.object({ tag: z.string().min(3).max(50) });

export const ConfigTagFieldsSchema = z.object({
  comparision: z.enum(
    [
      "EQ",
      "NE",
      "GT",
      "GE",
      "LT",
      "LE",
      "REGEX",
      "CONTAINS",
      "NOT_CONTAINS",
      "STARTS_WITH",
      "NOT_STARTS_WITH",
      "ENDS_WITH",
      "NOT_ENDS_WITH",
    ],
    { message: "Invalid comparision" },
  ),
  name: z.string().min(5).max(50),
  value: z.string().min(1, "Value cannot be empty"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

export const ConfigFileFieldsSchema = z.object({
  name: z.string().min(5).max(50),
  type: z.enum(["string", "amount", "number", "date", "time", "dateTime"], {
    message: "Invalid type",
  }),
  format: z.string(),
  expenseColumn: z.enum(["none", "amount", "date", "description"], {
    message: "Invalid expense column",
  }),
  expenseType: z.enum(
    [
      "EXPENSE_IF_GT_0",
      "EXPENSE_IF_GT_0_EL_INCOME",
      "INCOME_IF_GT_0",
      "INCOME_IF_GT_0_EL_EXPENSE",
    ],
    { message: "Invalid expense type" },
  ),
  ignore: z.boolean(),
  negated: z.boolean(),
  timeColumnIndex: z.coerce.number().int().min(0),
});

export const ConfigIgnoreFieldsSchema = z.object({
  name: z.enum(["description"], { message: "Invalid name" }),
  comparision: z.enum(
    [
      "EQ",
      "NE",
      "GT",
      "GE",
      "LT",
      "LE",
      "REGEX",
      "CONTAINS",
      "NOT_CONTAINS",
      "STARTS_WITH",
      "NOT_STARTS_WITH",
      "ENDS_WITH",
      "NOT_ENDS_WITH",
    ],
    { message: "Invalid comparision" },
  ),
  value: z.string().min(1),
});

export const ConfigTextAdjustFieldsSchema = z.object({
  scope: z.enum(["line"], { message: "Invalid scope" }),
  source: z.string().min(1),
  replaceWith: z.string().min(1),
});
