import mongoose from "mongoose";
import {
  ACCOUNT_TYPES,
  FIELD_TYPES,
  EXPENSE_FIELDS,
  EXPENSE_TYPE_COND,
} from "./const.js";

const configSchema = new mongoose.Schema({
  headerLines: {
    type: Number,
    default: 0,
  },
  separator: {
    type: String,
    default: ",",
  },
  trimQuotes: {
    type: Boolean,
    default: false,
  },
  fileFields: [
    {
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: FIELD_TYPES,
        required: true,
      },
      format: {
        type: String,
        default: "",
      },
      negated: {
        type: Boolean,
        default: false,
      },
      ignore: {
        type: Boolean,
        default: false,
      },
      timeColumnIndex: {
        type: Number,
        default: 0, // starts from coulmn 1...
      },
      expenseColumn: {
        type: String,
        enum: EXPENSE_FIELDS,
        required: true,
        default: "none",
      },
      expenseType: {
        type: String,
        enum: EXPENSE_TYPE_COND,
        required: false,
        default: "",
      },
    },
  ],
});

const ExpenseAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ACCOUNT_TYPES,
      required: true,
    },
    config: {
      type: configSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "expense_accounts",
  }
);

const ExpenseAccount = mongoose.model("ExpenseAccount", ExpenseAccountSchema);

export default ExpenseAccount;
