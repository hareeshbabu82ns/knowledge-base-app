"use client";

import { getExpenseAccountSchema } from "@/lib/validations/expense-account";
import { ExpenseAccount, Prisma } from "@/app/generated/prisma";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createAccount as createAction,
  updateAccount as updateAction,
  deleteAccount as deleteAction,
} from "../actions";
import { useSession } from "next-auth/react";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/SubmitButton";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountTypes } from "@/variables/expenses";
import { SelectItem } from "@/components/ui/select";
import { IConfig } from "@/types/expenses";
import { Icons } from "@/components/shared/icons";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";

interface AccountFormProps {
  id: ExpenseAccount[ "id" ];
  data: Partial<ExpenseAccount>;
  type: "create" | "update";
  // onSubmit: (data: Partial<ExpenseAccount>) => Promise<ExpenseAccount | null>;
}
export const AccountForm = ( { id, data, type }: AccountFormProps ) => {
  const router = useRouter();
  const session = useSession();
  const [ isLoading, setIsLoading ] = useState( false );
  const queryClient = useQueryClient();

  const FormValidation = getExpenseAccountSchema( type );

  const accountConfig = data?.config as never as IConfig;

  const form = useForm<z.infer<typeof FormValidation>>( {
    resolver: zodResolver( FormValidation ),
    defaultValues: {
      id: id ? id : "",
      name: data.name ? data.name : "",
      type: data?.type || "",
      description: data?.description || "",
      config: {
        headerLines: accountConfig?.headerLines || 0,
        separator: accountConfig?.separator || ",",
        trimQuotes: accountConfig?.trimQuotes || false,
      },
    },
  } );

  const {
    formState: { errors },
  } = form;

  const updateMutation = useMutation( {
    mutationKey: [ "account", id ],
    mutationFn: async ( {
      id,
      values,
    }: {
      id: ExpenseAccount[ "id" ];
      values: z.infer<typeof FormValidation>;
    } ) => {
      const updateData = {
        name: values.name,
        description: values.description,
        type: values.type,
        config: { ...( data?.config as Object ), ...values.config },
      } as Prisma.ExpenseAccountUpdateInput;
      const updatedData = await updateAction( id, updateData );
      return updatedData;
    },
    onMutate: async () => {
      setIsLoading( true );
    },
    onSuccess: ( updatedData ) => {
      queryClient.invalidateQueries( { queryKey: [ "accounts", "account", id ] } );
      form.reset( updatedData as any );
      toast.success( "Account updated successfully" );
    },
    onError: ( error ) => {
      console.log( error );
      toast.error( "An error occurred. Please try again." );
    },
    onSettled: () => {
      setIsLoading( false );
    },
  } );
  const createMutation = useMutation( {
    mutationFn: async ( values: z.infer<typeof FormValidation> ) => {
      const createData = {
        id: Buffer.from( values.name ).toString( "base64" ),
        name: values.name,
        description: values.description,
        type: "Saving Account",
        config: {},
        user: { connect: { id: session.data?.user.id } },
      } as Prisma.ExpenseAccountCreateInput;
      const createdData = await createAction( createData );
      return createdData;
    },
    onMutate: async () => {
      setIsLoading( true );
    },
    onSuccess: ( createdData ) => {
      queryClient.invalidateQueries( { queryKey: [ "accounts" ] } );
      form.reset();
      router.push( `/expenses/accounts/${createdData.id}` );
      router.refresh();
      toast.success( "Account created successfully" );
    },
    onError: ( error ) => {
      console.log( error );
      toast.error( "An error occurred. Please try again." );
    },
    onSettled: () => {
      setIsLoading( false );
    },
  } );
  const deleteMutation = useMutation( {
    mutationKey: [ "accounts" ],
    mutationFn: async ( id: ExpenseAccount[ "id" ] ) => {
      const deletedData = await deleteAction( id );
      return deletedData;
    },
    onMutate: async () => {
      setIsLoading( true );
    },
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: [ "accounts" ] } );
      router.replace( "/expenses/accounts" );
      router.refresh();
      toast.success( "Account deleted successfully" );
    },
    onError: ( error ) => {
      console.log( error );
      toast.error( "An error occurred. Please try again." );
    },
    onSettled: () => {
      setIsLoading( false );
    },
  } );

  const onSubmit = async ( values: z.infer<typeof FormValidation> ) => {
    if ( type === "update" && id ) {
      updateMutation.mutate( { id, values } );
    } else {
      createMutation.mutate( values );
    }
  };

  let buttonLabel;
  switch ( type ) {
    case "create":
      buttonLabel = "Create";
      break;
    default:
      buttonLabel = "Update";
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit( onSubmit )} className="flex-1 space-y-6">
        <section className="mb-5 space-y-4">
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
              placeholder="Account Name"
            />

            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="type"
              label="Type"
              placeholder="Select account type"
              className="@lg/details:max-w-[200px]"
            >
              {accountTypes.map( ( account, i ) => (
                <SelectItem key={account.name + i} value={account.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <p>{account.name}</p>
                  </div>
                </SelectItem>
              ) )}
            </CustomFormField>
          </div>

          <div className="@lg/details:flex-row @lg/details:gap-2 flex flex-col gap-6">
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              inputType="text"
              inputMode="numeric"
              control={form.control}
              name="config.headerLines"
              label="#Headers"
              required
              placeholder="Number of Header Lines"
            />
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="config.separator"
              label="Separator"
              required
              placeholder="Separator"
            />
            <CustomFormField
              className="min-w-32 flex-initial"
              fieldType={FormFieldType.SWITCH}
              control={form.control}
              name="config.trimQuotes"
              label="Trim Quotes"
              required
              placeholder="Trim Quotes"
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
            disabled={type === "create" || isLoading}
            toastId={`account-deletion-${id}`}
            toastLabel={`Delete Account? ${data.name}`}
            onClick={() => deleteMutation.mutate( id )}
          >
            Delete
          </DeleteConfirmButton>
          <SubmitButton isLoading={isLoading}>{buttonLabel}</SubmitButton>
        </div>
      </form>
    </Form>
  );
};
