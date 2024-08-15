"use client";

import { getExpenseAccountSchema } from "@/lib/validations/expense-account";
import { ExpenseAccount, Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createAccount as createAction,
  updateAccount as updateAction,
} from "../actions";
import { useSession } from "next-auth/react";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/SubmitButton";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import { toast } from "sonner";

interface AccountFormProps {
  id: ExpenseAccount["id"];
  data: Partial<ExpenseAccount>;
  type: "create" | "update";
  // onSubmit: (data: Partial<ExpenseAccount>) => Promise<ExpenseAccount | null>;
}
export const AccountForm = ({ id, data, type }: AccountFormProps) => {
  const router = useRouter();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const FormValidation = getExpenseAccountSchema(type);

  const form = useForm<z.infer<typeof FormValidation>>({
    resolver: zodResolver(FormValidation),
    defaultValues: {
      id: id ? id : "",
      name: data.name ? data.name : "",
      description: data?.description || "",
    },
  });

  const { formState } = form;
  console.log(formState);

  const onSubmit = async (values: z.infer<typeof FormValidation>) => {
    console.log(values);
    setIsLoading(true);

    try {
      if (type === "update" && id) {
        const updateData = {
          name: values.name,
          description: values.description,
        } as Prisma.ExpenseAccountUpdateInput;

        const updatedData = await updateAction(id, updateData);

        if (updatedData) {
          form.reset();
        }
      } else {
        const createData = {
          id: Buffer.from(values.name).toString("base64"),
          name: values.name,
          description: values.description,
          type: "Saving Account",
          config: {},
          user: { connect: { id: session.data?.user.id } },
        } as Prisma.ExpenseAccountCreateInput;

        const createdData = await createAction(createData);

        if (createdData) {
          form.reset();
          router.push(`/expenses/accounts/${createdData.id}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
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
        <section className="mb-12 space-y-4">
          <h1 className="header">
            {type === "create" ? "New Account" : "Update Account"}
          </h1>
        </section>
        {type === "update" && (
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="id"
            label="ID"
            placeholder="Account ID"
            disabled
          />
        )}

        <div className="flex flex-col gap-6">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            label="Name"
            placeholder="Account Name"
          />

          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="description"
            label="Notes"
          />
        </div>

        <SubmitButton isLoading={isLoading} className="w-full">
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};
