import mongoose from 'mongoose'
import { EXPENSE_TYPES } from './const.js'

const ExpenseTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tags: {
      type: [ String ],
      of: Number,
      required: true,
    },
    type: {
      type: String,
      enum: EXPENSE_TYPES,
      required: true,
    },
    // ref https://dockyard.com/blog/2020/02/14/you-probably-don-t-need-moment-js-anymore
    date: { // date in utc
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true
  }
)

const ExpenseTransaction = mongoose.model( 'ExpenseTransaction', ExpenseTransactionSchema )

export default ExpenseTransaction