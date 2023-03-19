import mongoose from 'mongoose'

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
        month: String,
        total: Number,
      }
    ],
    dailyData: [
      {
        date: String,
        total: Number,
      }
    ],
  },
  {
    timestamps: true
  }
)

const ExpenseTagStat = mongoose.model( 'ExpenseTagStat', ExpenseTagStatSchema )

export default ExpenseTagStat