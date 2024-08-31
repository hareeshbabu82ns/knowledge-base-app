import * as z from "zod";

const LoanBaseSchema = z.object({
  name: z.string().min(5).max(100),
  description: z.string().max(5000).optional(),
  amount: z.number().min(1),
  startDate: z.date(),
  durationMonths: z.number().min(1),
  frequency: z.enum(["MONTHLY", "BIWEEKLY"]),
  interestRate: z.number().min(0.5),
  emi: z.number().min(0),
});

export const LoanSchema = LoanBaseSchema.extend({
  id: z.string(),
});

export const LoanCreateSchema = LoanBaseSchema.extend({
  id: z.string().optional(),
});

export function getLoanSchema(type: "create" | "update") {
  switch (type) {
    case "create":
      return LoanCreateSchema;
    default:
      return LoanSchema;
  }
}

export const LoanRoiSchema = z.object({
  date: z.date(),
  rate: z.number().min(1),
});

export const LoanExtraPaymentSchema = z.object({
  date: z.date(),
  amount: z.number().min(1),
  continue: z.boolean(),
});
