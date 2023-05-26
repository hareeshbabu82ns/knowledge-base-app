import mongoose from "mongoose";
import { ACCOUNT_TYPES } from "./const.js";

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
  },
  {
    timestamps: true,
    collection: "expense_accounts",
  }
);

const ExpenseAccount = mongoose.model("ExpenseAccount", ExpenseAccountSchema);

export default ExpenseAccount;
