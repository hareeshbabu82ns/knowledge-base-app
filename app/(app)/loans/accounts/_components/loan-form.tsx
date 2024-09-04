"use client";

import { getLoanSchema } from "@/lib/validations/loans";
import { Loan, Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createLoan as createAction,
  updateLoan as updateAction,
  deleteLoan as deleteAction,
} from "../actions";
import { useSession } from "next-auth/react";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/SubmitButton";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loanFrequency } from "@/variables/loans";
import { SelectItem } from "@/components/ui/select";
import { calculateEMI } from "../../utils";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";

interface LoanFormProps {
  id: Loan["id"];
  data: Partial<Loan>;
  type: "create" | "update";
  // onSubmit: (data: Partial<Loan>) => Promise<Loan | null>;
}
export const LoanForm = ({ id, data, type }: LoanFormProps) => {
  const router = useRouter();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const FormValidation = getLoanSchema(type);

  const form = useForm<z.infer<typeof FormValidation>>({
    resolver: zodResolver(FormValidation),
    defaultValues: {
      id: id ? id : "",
      name: data.name ? data.name : "",
      description: data?.description || "",
      frequency: data?.frequency || "BIWEEKLY",
      amount: data?.amount || 0,
      emi: data?.emi || 0,
      startDate: data?.startDate || new Date(),
      durationMonths: data?.durationMonths || 360,
      interestRate: data?.interestRate || 0.0,
    },
  });

  const {
    formState: { errors },
  } = form;

  const updateMutation = useMutation({
    mutationKey: ["loan", id],
    mutationFn: async ({
      id,
      values,
    }: {
      id: Loan["id"];
      values: z.infer<typeof FormValidation>;
    }) => {
      const emi =
        values.emi === 0.0
          ? Number(
              calculateEMI({
                principal: values.amount,
                annualInterestRate: values.interestRate,
                loanTermMonths: values.durationMonths,
                paymentFrequency: values.frequency,
              }).toFixed(2),
            )
          : values.emi;
      const updateData = {
        name: values.name,
        description: values.description,
        amount: values.amount,
        startDate: values.startDate,
        durationMonths: values.durationMonths,
        frequency: values.frequency,
        emi,
        interestRate: values.interestRate,
      } as Prisma.LoanUpdateInput;
      const updatedData = await updateAction(id, updateData);
      return updatedData;
    },
    onMutate: async () => {
      setIsLoading(true);
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["loans", "loan", id] });
      form.reset(updatedData);
      toast.success("Loan updated successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof FormValidation>) => {
      const emi =
        values.emi === 0.0
          ? Number(
              calculateEMI({
                principal: values.amount,
                annualInterestRate: values.interestRate,
                loanTermMonths: values.durationMonths,
                paymentFrequency: values.frequency,
              }).toFixed(2),
            )
          : values.emi;
      const createData = {
        name: values.name,
        description: values.description,
        amount: values.amount,
        startDate: values.startDate,
        durationMonths: values.durationMonths,
        frequency: values.frequency,
        emi,
        interestRate: values.interestRate,
        user: { connect: { id: session.data?.user.id } },
      } as Prisma.LoanCreateInput;
      const createdData = await createAction(createData);
      return createdData;
    },
    onMutate: async () => {
      setIsLoading(true);
    },
    onSuccess: (createdData) => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      form.reset();
      router.push(`/loans/accounts/${createdData.id}`);
      router.refresh();
      toast.success("Loan created successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  const deleteMutation = useMutation({
    mutationKey: ["loans"],
    mutationFn: async (id: Loan["id"]) => {
      const deletedData = await deleteAction(id);
      return deletedData;
    },
    onMutate: async () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      router.replace("/loans/accounts");
      router.refresh();
      toast.success("Loan deleted successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof FormValidation>) => {
    if (type === "update" && id) {
      updateMutation.mutate({ id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  let buttonLabel;
  switch (type) {
    case "create":
      buttonLabel = "Create";
      break;
    default:
      buttonLabel = "Update";
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        <section className="mb-5 space-y-4">
          <h1 className="header">
            {type === "create" ? "New Loan" : "Update Loan"}
          </h1>
        </section>
        {type === "update" && (
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="id"
            label="ID"
            placeholder="Loan ID"
            disabled
            className="hidden"
          />
        )}

        <div className="flex flex-col gap-6">
          <div className="@lg/details:flex-row @lg/details:gap-2 flex flex-col gap-6">
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="name"
              label="Name"
              required
              placeholder="Loan Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="frequency"
              label="Frequency"
              placeholder="Select loan type"
              className="@lg/details:max-w-[200px]"
            >
              {loanFrequency.map((loan, i) => (
                <SelectItem key={loan.label + i} value={loan.value}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <p>{loan.label}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="startDate"
              label="Start Date"
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              required
              inputType="number"
              inputMode="decimal"
              name="amount"
              label="Amount"
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              required
              inputType="number"
              inputMode="decimal"
              name="interestRate"
              label="Rate of Interest (%)"
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              required
              inputType="number"
              inputMode="numeric"
              name="durationMonths"
              label="Term (Months)"
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              inputType="number"
              inputMode="decimal"
              name="emi"
              label="EMI (0 to Calc)"
            />
          </div>

          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="description"
            label="Notes"
          />
        </div>

        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset
          </Button>
          <DeleteConfirmButton
            variant="destructive"
            type="button"
            toastId={`loan-deletion-${id}`}
            toastLabel={`Delete Loan? ${data.name}`}
            onClick={() => deleteMutation.mutate(id)}
            disabled={type === "create" || isLoading}
          >
            Delete
          </DeleteConfirmButton>
          <SubmitButton isLoading={isLoading}>{buttonLabel}</SubmitButton>
        </div>
      </form>
    </Form>
  );
};
