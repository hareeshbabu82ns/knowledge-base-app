import mongoose from "mongoose";

const ExpenseAccountStatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    account: {
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
    collection: "expense_account_stats",
  }
);

const ExpenseAccountStat = mongoose.model(
  "ExpenseAccountStat",
  ExpenseAccountStatSchema
);

export default ExpenseAccountStat;
