import multer from "multer";
import {
  EXPENSE_TYPE_EXPENSE,
  EXPENSE_TYPE_INCOME,
} from "../models/Expenses/const.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage }).single("file");
// ref: https://programmingwithmosh.com/javascript/react-file-upload-proper-server-side-nodejs-easy/
export const uploadFile = async (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).send(req.file);
  });
};

export const KNOWN_COMMA_STRINGS = [
  { source: "Memory Express,", replaceWith: "Memory Express" },
  { source: "REMITLY CANADA,", replaceWith: "REMITLY CANADA" },
];

export const BANK_TRANSACTION_IGNORE_LINES = [
  "Transfer from MYCHEQUING",
  "Transfer to MYCHEQUING",
  "PAYMENT - THANK YOU",
  "Transfer to MYSAVINGS",
  "Transfer from MYSAVINGS",
  "PAYMENT - ",
  "Payment PCF",
];
export const BANK_TRANSACTION_IGNORE_LINES_STARTS_WITH = [
  "Loan Payment to GENWORTH",
  "Principal Pymt to GENWORTH",
  "Bill Payment ATB Mastercard",
];

const genericIgnore = ({ obj }) => {
  if (BANK_TRANSACTION_IGNORE_LINES.includes(obj.description)) return true;
  if (
    BANK_TRANSACTION_IGNORE_LINES_STARTS_WITH.findIndex((s) =>
      obj?.description?.startsWith(s)
    ) >= 0
  )
    return true;
  return false;
};

const BANK_TRANSACTION_IGNORE_LINES_PC_MONEY = [
  "Hareesh PC CC",
  "eTransfer Autodeposit",
  "Amazon Hareesh",
  "Jaya PC CC",
  "Walmart Hareesh",
];
export const BANK_TRANSACTION_CONV_CONFIG = [
  {
    bank: "PC",
    account: "PC Har Money",
    ignore: ({ obj }) => {
      if (genericIgnore({ obj })) return true;
      if (BANK_TRANSACTION_IGNORE_LINES_PC_MONEY.includes(obj.description))
        return true;
      return false;
    },
    fields: [
      {
        name: "amount",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.amount > 0
            ? objToUpload.amount
            : -1 * objToUpload.amount;
        },
      },
      {
        name: "account",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.bankAccount;
        },
      },
      {
        name: "description",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.description;
        },
      },
      {
        name: "tags",
        prepare: ({ config, objToUpload }) => {
          return [
            // objToUpload.accountNumber,
            objToUpload.bankConfig,
            objToUpload.bankAccount,
          ];
        },
      },
      {
        name: "type",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.amount > 0
            ? EXPENSE_TYPE_EXPENSE
            : EXPENSE_TYPE_INCOME;
        },
      },
      {
        name: "date",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.postingDate;
        },
      },
    ],
  },
  {
    bank: "PC",
    account: "PC Har CC",
    ignore: genericIgnore,
    fields: [
      {
        name: "amount",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.amount > 0
            ? objToUpload.amount
            : -1 * objToUpload.amount;
        },
      },
      {
        name: "account",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.bankAccount;
        },
      },
      {
        name: "description",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.description;
        },
      },
      {
        name: "tags",
        prepare: ({ config, objToUpload }) => {
          return [
            // objToUpload.accountNumber,
            objToUpload.bankConfig,
            objToUpload.bankAccount,
          ];
        },
      },
      {
        name: "type",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.amount > 0
            ? EXPENSE_TYPE_EXPENSE
            : EXPENSE_TYPE_INCOME;
        },
      },
      {
        name: "date",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.postingDate;
        },
      },
    ],
  },
  {
    bank: "Amazon",
    account: "Amazon MBNA CC",
    ignore: genericIgnore,
    fields: [
      {
        name: "amount",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.amount > 0
            ? objToUpload.amount
            : -1 * objToUpload.amount;
        },
      },
      {
        name: "account",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.bankAccount;
        },
      },
      {
        name: "description",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.payee + " - " + objToUpload.address;
        },
      },
      {
        name: "tags",
        prepare: ({ config, objToUpload }) => {
          return [
            // objToUpload.accountNumber,
            objToUpload.bankConfig,
            objToUpload.bankAccount,
          ];
        },
      },
      {
        name: "type",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.amount > 0
            ? EXPENSE_TYPE_EXPENSE
            : EXPENSE_TYPE_INCOME;
        },
      },
      {
        name: "date",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.postingDate;
        },
      },
    ],
  },
  {
    bank: "ATB",
    account: "ATB Har CC",
    ignore: genericIgnore,
    fields: [
      {
        name: "amount",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.debitAmount + objToUpload.creditAmount;
        },
      },
      {
        name: "account",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.bankAccount;
        },
      },
      {
        name: "description",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.extendedText;
        },
      },
      {
        name: "tags",
        prepare: ({ config, objToUpload }) => {
          return [
            // objToUpload.accountNumber,
            objToUpload.bankConfig,
            objToUpload.bankAccount,
          ];
        },
      },
      {
        name: "type",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.transactionType === "Debit"
            ? EXPENSE_TYPE_EXPENSE
            : EXPENSE_TYPE_INCOME;
        },
      },
      {
        name: "date",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.transactionDate;
        },
      },
    ],
  },
  {
    bank: "ATB",
    account: "ATB Har Sav",
    ignore: genericIgnore,
    fields: [
      {
        name: "amount",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.debitAmount + objToUpload.creditAmount;
        },
      },
      {
        name: "account",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.bankAccount;
        },
      },
      {
        name: "description",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.extendedText;
        },
      },
      {
        name: "tags",
        prepare: ({ config, objToUpload }) => {
          return [
            // objToUpload.accountNumber,
            objToUpload.bankConfig,
            objToUpload.bankAccount,
          ];
        },
      },
      {
        name: "type",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.debitAmount > 0
            ? EXPENSE_TYPE_EXPENSE
            : EXPENSE_TYPE_INCOME;
        },
      },
      {
        name: "date",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.transactionDate;
        },
      },
    ],
  },
  {
    bank: "ATB",
    account: "ATB Har Chq",
    ignore: genericIgnore,
    fields: [
      {
        name: "amount",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.debitAmount + objToUpload.creditAmount;
        },
      },
      {
        name: "account",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.bankAccount;
        },
      },
      {
        name: "description",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.extendedText;
        },
      },
      {
        name: "tags",
        prepare: ({ config, objToUpload }) => {
          return [
            // objToUpload.accountNumber,
            objToUpload.bankConfig,
            objToUpload.bankAccount,
          ];
        },
      },
      {
        name: "type",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.debitAmount > 0
            ? EXPENSE_TYPE_EXPENSE
            : EXPENSE_TYPE_INCOME;
        },
      },
      {
        name: "date",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.transactionDate;
        },
      },
    ],
  },
  {
    bank: "TD",
    account: "TD Har Sav",
    ignore: ({ obj }) => {
      if (genericIgnore({ obj })) return true;
      if (["PTS FRM:"].findIndex((s) => obj?.description?.startsWith(s)) >= 0)
        return true;
      if (["TFR-TO "].findIndex((s) => obj?.description?.includes(s)) >= 0)
        return true;
      return false;
    },
    fields: [
      {
        name: "amount",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.dipositAmount + objToUpload.creditAmount;
        },
      },
      {
        name: "account",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.bankAccount;
        },
      },
      {
        name: "description",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.description;
        },
      },
      {
        name: "tags",
        prepare: ({ config, objToUpload }) => {
          return [
            // objToUpload.accountNumber,
            objToUpload.bankConfig,
            objToUpload.bankAccount,
          ];
        },
      },
      {
        name: "type",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.dipositAmount > 0
            ? EXPENSE_TYPE_EXPENSE
            : EXPENSE_TYPE_INCOME;
        },
      },
      {
        name: "date",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.postingDate;
        },
      },
    ],
  },
  {
    bank: "TD",
    account: "TD Har Chq",
    ignore: ({ obj }) => {
      if (genericIgnore({ obj })) return true;
      // if (["REMITLY CANADA MSP"].includes(obj?.description)) return true;
      if (
        ["PTS FRM:", "PTS TO:", "REMITLY CANADA"].findIndex((s) =>
          obj?.description?.startsWith(s)
        ) >= 0
      )
        return true;
      if (
        ["TFR-TO ", "TFR-FR 6070101"].findIndex((s) =>
          obj?.description?.includes(s)
        ) >= 0
      )
        return true;
      return false;
    },
    fields: [
      {
        name: "amount",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.dipositAmount + objToUpload.creditAmount;
        },
      },
      {
        name: "account",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.bankAccount;
        },
      },
      {
        name: "description",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.description;
        },
      },
      {
        name: "tags",
        prepare: ({ config, objToUpload }) => {
          return [
            // objToUpload.accountNumber,
            objToUpload.bankConfig,
            objToUpload.bankAccount,
          ];
        },
      },
      {
        name: "type",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.creditAmount > 0
            ? EXPENSE_TYPE_EXPENSE
            : EXPENSE_TYPE_INCOME;
        },
      },
      {
        name: "date",
        prepare: ({ config, objToUpload }) => {
          return objToUpload.postingDate;
        },
      },
    ],
  },
];
export const BANK_CSV_CONV_CONFIG = [
  {
    bank: "TD",
    headerLine: false,
    separator: ",",
    fields: [
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
  {
    bank: "Amazon",
    headerLine: true,
    separator: ",",
    fields: [
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
  {
    bank: "ATB",
    headerLine: true,
    separator: ",",
    fields: [
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
  {
    bank: "PC",
    headerLine: true,
    separator: ",",
    trimQuotes: true,
    fields: [
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
];
