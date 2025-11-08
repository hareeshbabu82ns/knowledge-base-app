// import { E164Number } from "libphonenumber-js/core";
import { Control } from "react-hook-form";
// import PhoneInput from "react-phone-number-input";

import { Checkbox } from "./ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Icons } from "./shared/icons";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Switch } from "./ui/switch";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  // PHONE_INPUT = "phoneInput",
  SWITCH = "switch",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

interface CustomProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  iconSrc?: React.ReactNode;
  disabled?: boolean;
  dateFormat?: string;
  fromMonth?: Date;
  toMonth?: Date;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  fieldType: FormFieldType;
  className?: string;
  fieldClassName?: string;
  inputType?: React.HTMLInputTypeAttribute;
  inputMode?:
    | "search"
    | "text"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal"
    | undefined;
}

const RenderInput = ({ field, props }: { field: any; props: CustomProps }) => {
  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <FormControl>
          <div className="relative">
            {props.iconSrc && (
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2">
                {props.iconSrc}
              </div>
            )}
            <Input
              placeholder={props.placeholder}
              {...field}
              onChange={(e) =>
                field.onChange(
                  props.inputMode === "numeric"
                    ? Number(e.target.value)
                    : e.target.value,
                )
              }
              type={props.inputType}
              inputMode={props.inputMode}
              required={props.required}
              disabled={props.disabled}
              className={cn(
                "peer",
                props.iconSrc ? "p-2.5 ps-10" : "",
                props.fieldClassName,
              )}
            />
          </div>
        </FormControl>
      );
    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            disabled={props.disabled}
            required={props.required}
            className={props.fieldClassName}
          />
        </FormControl>
      );
    // case FormFieldType.PHONE_INPUT:
    //   return (
    //     <FormControl>
    //       <PhoneInput
    //         defaultCountry="US"
    //         placeholder={props.placeholder}
    //         international
    //         withCountryCallingCode
    //         value={field.value as E164Number | undefined}
    //         onChange={field.onChange}
    //         className="input-phone"
    //       />
    //     </FormControl>
    //   );
    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value}
              required={props.required}
              onCheckedChange={field.onChange}
            />
            <label htmlFor={props.name} className="checkbox-label">
              {props.label}
            </label>
          </div>
        </FormControl>
      );
    case FormFieldType.SWITCH:
      return (
        <div className="flex h-10 flex-row items-center justify-center rounded-lg border px-2">
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </div>
      );
    case FormFieldType.DATE_PICKER:
      return (
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground",
                )}
              >
                <Icons.calendar className="mr-2 size-4" />
                {field.value ? (
                  format(field.value, "PP")
                ) : (
                  <span>{props.placeholder || "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                className="rounded-xs border shadow-sm w-56"
                captionLayout="dropdown"
                selected={field.value}
                onSelect={(date?: Date) => field.onChange(date)}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            required={props.required}
            disabled={props.disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{props.children}</SelectContent>
          </Select>
        </FormControl>
      );
    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;
    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, name, label, className } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("relative flex-1", className)}>
          <RenderInput field={field} props={props} />
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel
              className="bg-background absolute start-1 top-2 z-10 origin-[0] -translate-y-6 scale-90 px-1 duration-300"
              htmlFor={name}
            >
              {/* {props.required ? `${label} *` : label} */}
              {label}
              {props.required && " *"}
            </FormLabel>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
