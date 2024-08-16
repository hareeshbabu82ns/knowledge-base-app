import * as z from "zod";

const ExpenseAccountBaseSchema = z.object({
  name: z.string().min(5).max(100),
  description: z.string().min(5).max(5000).optional(),
  type: z.string(),
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
