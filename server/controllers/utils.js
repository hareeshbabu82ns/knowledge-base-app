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
];

export const BANK_TRANSACTION_CONV_CONFIG = [
  {
    bank: "ATB",
    account: "ATB Har CC",
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
            objToUpload.accountNumber,
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
    bank: "Amazon MBNA CC",
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
        type: "date",
        format: "LL/dd/yyyy",
      },
      {
        name: "postingTime",
        type: "string",
      },
      {
        name: "amount",
        type: "amount",
      },
    ],
  },
];
