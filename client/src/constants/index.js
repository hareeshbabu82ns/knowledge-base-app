export const EXPENSE_TYPES = ["Income", "Expense", "Ignore"];

export const ACCOUNT_TYPES = [
  "Checking Account",
  "Saving Account",
  "Credit Card",
  "Home Loan",
  "Vehicle Loan",
];

export const INTL_DATE_LONG_OPTIONS = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
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
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "creditAmount",
          type: "amount",
        },
        {
          name: "dipositAmount",
          type: "amount",
        },
        {
          name: "balanceAmount",
          type: "amount",
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
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "creditAmount",
          type: "amount",
        },
        {
          name: "dipositAmount",
          type: "amount",
        },
        {
          name: "balanceAmount",
          type: "amount",
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
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "creditAmount",
          type: "amount",
        },
        {
          name: "dipositAmount",
          type: "amount",
        },
        {
          name: "balanceAmount",
          type: "amount",
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
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "creditAmount",
          type: "amount",
        },
        {
          name: "dipositAmount",
          type: "amount",
        },
        {
          name: "balanceAmount",
          type: "amount",
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
      fileFields: [
        {
          name: "description",
          type: "string",
        },
        {
          name: "transactionType",
          type: "string",
        },
        {
          name: "cardHolderName",
          type: "string",
        },
        {
          name: "postingDate",
          type: "dateTime",
          timeColumnIndex: 5,
          format: "LL/dd/yyyy h:mm a",
        },
        {
          name: "postingTime",
          type: "string",
        },
        {
          name: "amount",
          type: "amount",
          negated: true,
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
      fileFields: [
        {
          name: "description",
          type: "string",
        },
        {
          name: "transactionType",
          type: "string",
        },
        {
          name: "cardHolderName",
          type: "string",
        },
        {
          name: "postingDate",
          type: "dateTime",
          timeColumnIndex: 5,
          format: "LL/dd/yyyy h:mm a",
        },
        {
          name: "postingTime",
          type: "string",
        },
        {
          name: "amount",
          type: "amount",
          negated: true,
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
      fileFields: [
        {
          name: "postingDate",
          type: "date",
          format: "LL/dd/yyyy",
        },
        {
          name: "payee",
          type: "string",
        },
        {
          name: "address",
          type: "string",
        },
        {
          name: "amount",
          type: "amount",
          negated: true,
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
      fileFields: [
        {
          name: "transactionDate",
          type: "date",
          format: "LL/dd/yyyy",
        },
        {
          name: "accountRtn",
          type: "string",
        },
        {
          name: "accountNumber",
          type: "string",
        },
        {
          name: "transactionType",
          type: "string",
        },
        {
          name: "customerRefNumber",
          type: "string",
        },
        {
          name: "debitAmount",
          type: "amount",
        },
        {
          name: "creditAmount",
          type: "amount",
        },
        {
          name: "runningBalanceAmount",
          type: "amount",
        },
        {
          name: "extendedText",
          type: "string",
        },
        {
          name: "bankRefNumber",
          type: "string",
        },
        {
          name: "emptyEnding",
          type: "string",
          ignore: true,
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
      fileFields: [
        {
          name: "transactionDate",
          type: "date",
          format: "LL/dd/yyyy",
        },
        {
          name: "accountRtn",
          type: "string",
        },
        {
          name: "accountNumber",
          type: "string",
        },
        {
          name: "transactionType",
          type: "string",
        },
        {
          name: "customerRefNumber",
          type: "string",
        },
        {
          name: "debitAmount",
          type: "amount",
        },
        {
          name: "creditAmount",
          type: "amount",
        },
        {
          name: "runningBalanceAmount",
          type: "amount",
        },
        {
          name: "extendedText",
          type: "string",
        },
        {
          name: "bankRefNumber",
          type: "string",
        },
        {
          name: "emptyEnding",
          type: "string",
          ignore: true,
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
      fileFields: [
        {
          name: "transactionDate",
          type: "date",
          format: "LL/dd/yyyy",
        },
        {
          name: "accountRtn",
          type: "string",
        },
        {
          name: "accountNumber",
          type: "string",
        },
        {
          name: "transactionType",
          type: "string",
        },
        {
          name: "customerRefNumber",
          type: "string",
        },
        {
          name: "debitAmount",
          type: "amount",
        },
        {
          name: "creditAmount",
          type: "amount",
        },
        {
          name: "runningBalanceAmount",
          type: "amount",
        },
        {
          name: "extendedText",
          type: "string",
        },
        {
          name: "bankRefNumber",
          type: "string",
        },
        {
          name: "emptyEnding",
          type: "string",
          ignore: true,
        },
      ],
    },
  },
];
