import mongoose from 'mongoose'
import { EXPENSE_TYPES } from './const.js'

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

const ExpenseTypeStat = mongoose.model( 'ExpenseTypeStat', ExpenseTypeStatSchema )

export default ExpenseTypeStat