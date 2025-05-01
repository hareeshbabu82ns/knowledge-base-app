"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Prisma } from "@/app/generated/prisma";
import React from "react";
import { useForm } from "@tanstack/react-form";
import { ConfigComparisionEnum, IConfigIgnoreOptions } from "@/types/expenses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Option } from "@/components/ui/multi-select";
import {
  configComparisionOptions,
  configTagNameOptions,
} from "@/variables/expenses";
import { useMutation } from "@tanstack/react-query";
import { addAccountConfigIgnoreFields } from "../actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CompProps {
  rowData: Prisma.ExpenseTransactionCreateManyInput;
}

const ConfigAddIgnoreForm = ( { rowData }: CompProps ) => {
  const { mutate: addAccountConfigIgnoreFieldsFn } = useMutation( {
    mutationFn: async ( data: IConfigIgnoreOptions ) => {
      return addAccountConfigIgnoreFields( rowData.account, [ data ] );
    },
    onSuccess: () => {
      toast.success( "Filter added successfully" );
    },
  } );

  const form = useForm<IConfigIgnoreOptions>( {
    defaultValues: {
      name: "description",
      comparision: "STARTS_WITH",
      value: rowData.description || "",
    },
    onSubmit: async ( { value } ) => {
      addAccountConfigIgnoreFieldsFn( value );
    },
  } );

  return (
    <form
      onSubmit={( e ) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="grid gap-4 py-4">
        <form.Field name="name">
          {( field ) => {
            return (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Field</Label>
                <Select
                  onValueChange={field.handleChange}
                  value={field.state.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.name} />
                  </SelectTrigger>
                  <SelectContent>
                    {generateFilterOptions( configTagNameOptions )}
                  </SelectContent>
                </Select>
              </div>
            );
          }}
        </form.Field>
        <form.Field name="comparision">
          {( field ) => {
            return (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Comparision</Label>
                <Select
                  onValueChange={( v ) =>
                    field.handleChange( v as ConfigComparisionEnum )
                  }
                  value={field.state.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.name} />
                  </SelectTrigger>
                  <SelectContent>
                    {generateFilterOptions( configComparisionOptions )}
                  </SelectContent>
                </Select>
              </div>
            );
          }}
        </form.Field>
        <form.Field
          name="value"
          validators={{
            onSubmit: ( { value } ) => {
              return value ? undefined : "Value is required";
            },
          }}
        >
          {( field ) => {
            return (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Value</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={( e ) => field.handleChange( e.target.value )}
                  type="text"
                  value={field.state.value}
                  placeholder={field.name}
                />
                {field.state.meta.errors ? (
                  <em className="text-destructive text-sm">
                    {field.state.meta.errors.join( ", " )}
                  </em>
                ) : null}
              </div>
            );
          }}
        </form.Field>
        <div className="mt-4 flex flex-row-reverse gap-2">
          <Button type="submit">Add Filter</Button>
          <Button type="button" variant="outline" onClick={form.reset}>
            Reset
          </Button>
        </div>
      </div>
    </form>
  );
};

function generateFilterOptions( filterOptions?: Option[] ) {
  if ( !filterOptions ) return null;

  return filterOptions.map( ( { value, label } ) => (
    <SelectItem key={value} value={value}>
      <div className="flex cursor-pointer items-center gap-2">
        <p>{label}</p>
      </div>
    </SelectItem>
  ) );
}
export default ConfigAddIgnoreForm;
