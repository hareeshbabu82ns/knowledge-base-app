import * as z from "zod";

export const ExpenseAccountSchema = z.object({
  id: z.string(),
  name: z.string().min(5).max(100),
  description: z.string().min(5).max(5000).optional(),
});

export const ExpenseAccountCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(5).max(100),
  description: z.string().min(5).max(5000).optional(),
});

export function getExpenseAccountSchema(type: "create" | "update") {
  switch (type) {
    case "create":
      return ExpenseAccountCreateSchema;
    default:
      return ExpenseAccountSchema;
  }
}
