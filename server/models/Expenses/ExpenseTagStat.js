import mongoose from "mongoose";

const ExpenseTagStatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    tag: {
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
    collection: "expense_tag_stats",
  }
);

const ExpenseTagStat = mongoose.model("ExpenseTagStat", ExpenseTagStatSchema);

export default ExpenseTagStat;
