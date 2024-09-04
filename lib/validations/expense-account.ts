import * as z from "zod";

const ExpenseAccountBaseSchema = z.object({
  name: z.string().min(5).max(100),
  description: z.string().max(5000).optional(),
  type: z.string(),
  config: z
    .object({
      headerLines: z.number().optional(),
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
