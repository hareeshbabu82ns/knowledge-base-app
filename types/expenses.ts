enum ConfigComparision {
  EQUALS = "EQ",
  NOT_EQUALS = "NE",
  GREATER_THAN = "GT",
  GREATER_THAN_OR_EQUAL = "GE",
  LESS_THAN = "LT",
  LESS_THAN_OR_EQUAL = "LE",
  CONTAINS = "CONTAINS",
  NOT_CONTAINS = "NOT_CONTAINS",
  STARTS_WITH = "STARTS_WITH",
  NOT_STARTS_WITH = "NOT_STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
  NOT_ENDS_WITH = "NOT_ENDS_WITH",
}

enum ConfigTextAdjustScope {
  LINE = "line",
}

export interface IConfigText {
  scope: ConfigTextAdjustScope;
  source: string;
  replaceWith: string;
}

export interface IConfigIgnoreOptions {
  name: string;
  comparision: ConfigComparision;
  value: string;
}

export interface IConfigTagOptions {
  name: string;
  comparision: ConfigComparision;
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
