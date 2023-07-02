import mongoose from "mongoose";
import { EXPENSE_TYPES } from "./const.js";

const ExpenseUserStatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
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
        month: Number,
        date: Number,
        total: Number,
      },
    ],
  },
  {
    timestamps: true,
    collection: "expense_user_stats",
  }
);

const ExpenseUserStat = mongoose.model(
  "ExpenseUserStat",
  ExpenseUserStatSchema
);

export default ExpenseUserStat;
