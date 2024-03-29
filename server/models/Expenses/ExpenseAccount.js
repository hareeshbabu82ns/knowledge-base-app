import mongoose from "mongoose";
import {
  ACCOUNT_TYPES,
  FIELD_TYPES,
  EXPENSE_FIELDS,
  EXPENSE_TYPE_COND,
  COMPARISION_OPS,
  COMPARISION_OPS_EQ,
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
  textToAdjust: [
    {
      scope: {
        type: String,
        required: true,
        default: "line",
      },
      source: {
        type: String,
        required: true,
      },
      replaceWith: {
        type: String,
        required: true,
        default: "",
      },
    },
  ],
  ignoreOps: [
    {
      name: {
        type: String,
        required: true,
      },
      comparision: {
        type: String,
        enum: COMPARISION_OPS,
        required: true,
        default: COMPARISION_OPS_EQ,
      },
      value: {
        type: String,
        required: false,
        default: "",
      },
    },
  ],
  tagOps: [
    {
      name: {
        type: String,
        required: true,
      },
      comparision: {
        type: String,
        enum: COMPARISION_OPS,
        required: true,
        default: COMPARISION_OPS_EQ,
      },
      value: {
        type: String,
        required: false,
        default: "",
      },
      tags: {
        type: [String],
        required: true,
      },
    },
  ],
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
    _id: {
      type: String,
      required: true,
    },
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
    _id: false,
    timestamps: true,
    collection: "expense_accounts",
  }
);

const ExpenseAccount = mongoose.model("ExpenseAccount", ExpenseAccountSchema);

export default ExpenseAccount;
