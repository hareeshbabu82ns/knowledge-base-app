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

export const BANK_ACCOUNTS_DEFAULT = [
  {
    name: "TD Har Sav",
    description: "",
    type: "Saving Account",
    config: {
      headerLines: 0,
      separator: ",",
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "PTS FRM: 80816063318",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_CONTAINS,
          value: "TFR-TO 6063318",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_STARTS_WITH,
          value: "CAD DRAFT",
        },
      ],
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
          expenseColumn: "date",
        },
        {
          name: "description",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "creditAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
        },
        {
          name: "dipositAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_INCOME_IF_GT_0,
        },
        {
          name: "balanceAmount",
          type: "amount",
          expenseColumn: "none",
        },
      ],
    },
  },
  {
    name: "TD Har Chq",
    description: "",
    type: "Checking Account",
    config: {
      headerLines: 0,
      separator: ",",
      textToAdjust: [
        {
          scope: "line",
          source: "REMITLY CANADA,",
          replaceWith: "REMITLY CANADA",
        },
      ],
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "PTS TO:  80816070101",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_STARTS_WITH,
          value: "REMITLY CANADA",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_CONTAINS,
          value: "TFR-FR 6070101",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_STARTS_WITH,
          value: "E-TRANSFER ***",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_STARTS_WITH,
          value: "SEND E-TFR ***",
        },
      ],
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
          expenseColumn: "date",
        },
        {
          name: "description",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "creditAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
        },
        {
          name: "dipositAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_INCOME_IF_GT_0,
        },
        {
          name: "balanceAmount",
          type: "amount",
          expenseColumn: "none",
        },
      ],
    },
  },
  {
    name: "TD Jaya Sav",
    description: "",
    type: "Saving Account",
    config: {
      headerLines: 0,
      separator: ",",
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_CONTAINS,
          value: "TFR-TO 6889907",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_CONTAINS,
          value: "TFR-FR 6889907",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_STARTS_WITH,
          value: "SEND E-TFR ***",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "CAD DRAFT 03024417",
        },
      ],
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
          expenseColumn: "date",
        },
        {
          name: "description",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "creditAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
        },
        {
          name: "dipositAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_INCOME_IF_GT_0,
        },
        {
          name: "balanceAmount",
          type: "amount",
          expenseColumn: "none",
        },
      ],
    },
  },
  {
    name: "TD Jaya Chq",
    description: "",
    type: "Checking Account",
    config: {
      headerLines: 0,
      separator: ",",
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_CONTAINS,
          value: "TFR-TO 6888064",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_CONTAINS,
          value: "TFR-FR 6888064",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_STARTS_WITH,
          value: "SEND E-TFR ***",
        },
      ],
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
          expenseColumn: "date",
        },
        {
          name: "description",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "creditAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
        },
        {
          name: "dipositAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_INCOME_IF_GT_0,
        },
        {
          name: "balanceAmount",
          type: "amount",
          expenseColumn: "none",
        },
      ],
    },
  },
  {
    name: "PC Har CC",
    description: "",
    type: "Credit Card",
    config: {
      headerLines: 1,
      separator: ",",
      trimQuotes: true,
      textToAdjust: [
        {
          scope: "line",
          source: "Memory Express,",
          replaceWith: "Memory Express",
        },
      ],
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Payment PCF",
        },
      ],
      fileFields: [
        {
          name: "description",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "transactionType",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "cardHolderName",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "postingDate",
          type: "dateTime",
          timeColumnIndex: 5,
          format: "LL/dd/yyyy h:mm a",
          expenseColumn: "date",
        },
        {
          name: "postingTime",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "amount",
          type: "amount",
          negated: true,
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0_EL_INCOME,
        },
      ],
    },
  },
  {
    name: "PC Har Money",
    description: "",
    type: "Checking Account",
    config: {
      headerLines: 1,
      separator: ",",
      trimQuotes: true,
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Hareesh PC CC",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Amazon Hareesh",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Walmart Hareesh",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Jaya PC CC",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "eTransfer Autodeposit",
        },
      ],
      fileFields: [
        {
          name: "description",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "transactionType",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "cardHolderName",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "postingDate",
          type: "dateTime",
          timeColumnIndex: 5,
          format: "LL/dd/yyyy h:mm a",
          expenseColumn: "date",
        },
        {
          name: "postingTime",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "amount",
          type: "amount",
          negated: true,
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0_EL_INCOME,
        },
      ],
    },
  },
  {
    name: "Amazon MBNA CC",
    description: "",
    type: "Credit Card",
    config: {
      headerLines: 1,
      separator: ",",
      trimQuotes: true,
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "PAYMENT",
        },
      ],
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
          expenseColumn: "date",
        },
        {
          name: "payee",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "address",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "amount",
          type: "amount",
          negated: true,
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0_EL_INCOME,
        },
      ],
    },
  },
  {
    name: "ATB Har Chq",
    description: "",
    type: "Checking Account",
    config: {
      headerLines: 1,
      separator: ",",
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Bill Payment ATB Mastercard to ATB CC",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_STARTS_WITH,
          value: "Principal Pymt to GENWORTH",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Bill Payment to Amazaon Hareesh",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Transfer to MYSAVINGS",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Transfer from MYSAVINGS",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "INTERAC e-Transfer Sent - Har TD",
        },
      ],
      fileFields: [
        {
          name: "transactionDate",
          type: "date",
          format: "LL/dd/yyyy",
          expenseColumn: "date",
        },
        {
          name: "accountRtn",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "accountNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "transactionType",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "customerRefNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "debitAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
        },
        {
          name: "creditAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_INCOME_IF_GT_0,
        },
        {
          name: "runningBalanceAmount",
          type: "amount",
          expenseColumn: "none",
        },
        {
          name: "extendedText",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "bankRefNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "emptyEnding",
          type: "string",
          ignore: true,
          expenseColumn: "none",
        },
      ],
    },
  },
  {
    name: "ATB Har Sav",
    description: "",
    type: "Saving Account",
    config: {
      headerLines: 1,
      separator: ",",
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Transfer from MYCHEQUING",
        },
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "Transfer to MYCHEQUING",
        },
      ],
      fileFields: [
        {
          name: "transactionDate",
          type: "date",
          format: "LL/dd/yyyy",
          expenseColumn: "date",
        },
        {
          name: "accountRtn",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "accountNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "transactionType",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "customerRefNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "debitAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
        },
        {
          name: "creditAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_INCOME_IF_GT_0,
        },
        {
          name: "runningBalanceAmount",
          type: "amount",
          expenseColumn: "none",
        },
        {
          name: "extendedText",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "bankRefNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "emptyEnding",
          type: "string",
          ignore: true,
          expenseColumn: "none",
        },
      ],
    },
  },
  {
    name: "ATB Har CC",
    description: "",
    type: "Credit Card",
    config: {
      headerLines: 1,
      separator: ",",
      tagOps: [],
      ignoreOps: [
        {
          name: "description",
          comparision: COMPARISION_OPS_EQ,
          value: "PAYMENT - THANK YOU",
        },
      ],
      fileFields: [
        {
          name: "transactionDate",
          type: "date",
          format: "LL/dd/yyyy",
          expenseColumn: "date",
        },
        {
          name: "accountRtn",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "accountNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "transactionType",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "customerRefNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "debitAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
        },
        {
          name: "creditAmount",
          type: "amount",
          expenseColumn: "amount",
          expenseType: EXPENSE_TYPE_COND_INCOME_IF_GT_0,
        },
        {
          name: "runningBalanceAmount",
          type: "amount",
          expenseColumn: "none",
        },
        {
          name: "extendedText",
          type: "string",
          expenseColumn: "description",
        },
        {
          name: "bankRefNumber",
          type: "string",
          expenseColumn: "none",
        },
        {
          name: "emptyEnding",
          type: "string",
          ignore: true,
          expenseColumn: "none",
        },
      ],
    },
  },
];
