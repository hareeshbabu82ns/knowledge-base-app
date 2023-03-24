import mongoose from "mongoose";
import { EXPENSE_TYPES } from "./const.js";

const ExpenseTypeStatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: EXPENSE_TYPES,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    yearlyTotal: Number,
    monthlyData: [
      {
        month: Number,
        total: Number,
      },
    ],
    dailyData: [
      {
        date: Number,
        total: Number,
      },
    ],
  },
  {
    timestamps: true,
    collection: "expense_type_stats",
  }
);

const ExpenseTypeStat = mongoose.model(
  "ExpenseTypeStat",
  ExpenseTypeStatSchema
);

export default ExpenseTypeStat;
