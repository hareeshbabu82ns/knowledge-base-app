import * as z from "zod";

export const ExpenseTransactionSchema = z.object({
  date: z.date(),
  account: z.string().min(1, "Account is required"),
  amount: z.coerce.number().min(0.1, "Amount must be greater than 0"),
  description: z.string().max(5000).optional(),
  type: z.enum(["Expense", "Income"], { message: "Invalid Type" }),
  tags: z.array(z.string()).nonempty(),
});

const ExpenseAccountBaseSchema = z.object({
  name: z.string().min(5).max(100),
  description: z.string().max(5000).optional(),
  type: z.string(),
  config: z
    .object({
      headerLines: z.coerce.number().optional(),
      separator: z.string().min(1),
      trimQuotes: z.boolean().optional(),
    })
    .optional(),
});

export const ExpenseAccountSchema = ExpenseAccountBaseSchema.extend({
  id: z.string(),
});

export const ExpenseAccountCreateSchema = ExpenseAccountBaseSchema.extend({
  id: z.string().optional(),
});

export function getExpenseAccountSchema(type: "create" | "update") {
  switch (type) {
    case "create":
      return ExpenseAccountCreateSchema;
    default:
      return ExpenseAccountSchema;
  }
}
