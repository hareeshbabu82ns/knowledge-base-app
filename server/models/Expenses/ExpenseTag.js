import mongoose from "mongoose";

const ExpenseTagSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "expense_tags",
  }
);

const ExpenseTag = mongoose.model("ExpenseTag", ExpenseTagSchema);

export default ExpenseTag;
