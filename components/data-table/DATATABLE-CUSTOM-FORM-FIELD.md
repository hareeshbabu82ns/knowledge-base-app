# DatatableCustomFormField Component

## Overview

A type-safe, generic form field component for DataTable row editing that automatically renders the appropriate input based on column metadata. Enhanced with TypeScript generics, proper error handling, and easy extensibility.

## Features

✅ **Type Safety**: Full TypeScript support with generic types  
✅ **Conditional Loading**: Only fetches options when needed (select/multiSelect)  
✅ **Error Handling**: User-friendly error messages with retry logic  
✅ **11 Input Variants**: text, number, textArea, checkbox, switch, date, dateRange, select, multiSelect, range, skeleton  
✅ **Extensible**: Easy to add new input variants  
✅ **Async Options**: Support for dynamic option loading  
✅ **Performance**: Memoized query functions, proper staleTime and retry logic

## Basic Usage

### 1. Define Column Meta

```typescript
import { ColumnDef } from "@tanstack/react-table";

interface YourDataType {
  id: string;
  name: string;
  status: string;
  priority: number;
  tags: string[];
  // ... other fields
}

const columns: ColumnDef<YourDataType>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      cellInputVariant: "text",
      fieldType: "string",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      cellInputVariant: "select",
      fieldType: "string",
      filterOptions: [
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Completed" },
      ],
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    meta: {
      cellInputVariant: "number",
      fieldType: "number",
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    meta: {
      cellInputVariant: "multiSelect",
      fieldType: "array",
      filterOptionsFn: async () => {
        const response = await fetch("/api/tags");
        return response.json();
      },
    },
  },
];
```

### 2. Use in Form

```typescript
import { useForm } from "react-hook-form";
import DatatableCustomFormField from "@/components/data-table/datatable-custom-form-field";

interface FormValues {
  name: string;
  status: string;
  priority: number;
  tags: string[];
}

function RowEditForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      status: "active",
      priority: 0,
      tags: []
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {columns.map((column) => (
        <DatatableCustomFormField
          key={column.id}
          column={column}
          control={form.control}
          name={column.accessorKey as string}
          label={column.header as string}
          placeholder={`Enter ${column.header}`}
          required
        />
      ))}
      <button type="submit">Save</button>
    </form>
  );
}
```

## Supported Input Variants

### Text Input

```typescript
meta: {
  cellInputVariant: "text",
  fieldType: "string"
}
```

### Number Input

```typescript
meta: {
  cellInputVariant: "number",
  fieldType: "number"
}
```

### Text Area

```typescript
meta: {
  cellInputVariant: "textArea",
  fieldType: "string"
}
```

### Checkbox

```typescript
meta: {
  cellInputVariant: "checkbox",
  fieldType: "boolean"
}
```

### Switch

```typescript
meta: {
  cellInputVariant: "switch",
  fieldType: "boolean"
}
```

### Date Picker

```typescript
meta: {
  cellInputVariant: "date",
  fieldType: "date"
}

// In component
<DatatableCustomFormField
  column={column}
  control={form.control}
  name="startDate"
  label="Start Date"
  dateFormat="PPP"
  fromMonth={new Date(2020, 0)}
  toMonth={new Date(2025, 11)}
/>
```

### Date Range

```typescript
meta: {
  cellInputVariant: "dateRange",
  fieldType: "subObject"
}
```

### Select (Single)

```typescript
meta: {
  cellInputVariant: "select",
  fieldType: "string",
  filterOptions: [
    { value: "option1", label: "Option 1", icon: <Icon /> },
    { value: "option2", label: "Option 2" }
  ]
}
```

### Multi-Select

```typescript
meta: {
  cellInputVariant: "multiSelect",
  fieldType: "array",
  filterOptions: [
    { value: "tag1", label: "Tag 1" },
    { value: "tag2", label: "Tag 2" }
  ]
}
```

### Range (Number Range)

```typescript
meta: {
  cellInputVariant: "range",
  fieldType: "subObject"
}
```

### Skeleton (Custom)

```typescript
meta: {
  cellInputVariant: "skeleton",
  fieldType: "string"
}

// Pass custom renderer
<DatatableCustomFormField
  column={column}
  control={form.control}
  name="custom"
  renderSkeleton={(field) => <CustomComponent {...field} />}
/>
```

## Async Options Loading

### Static Options

```typescript
meta: {
  cellInputVariant: "select",
  fieldType: "string",
  filterOptions: [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" }
  ]
}
```

### Dynamic Options (Function)

```typescript
meta: {
  cellInputVariant: "select",
  fieldType: "string",
  filterOptionsFn: async () => {
    try {
      const response = await fetch('/api/options');
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('Options fetch error:', error);
      throw error;
    }
  }
}
```

### Options with Icons

```typescript
import { Icons } from "@/components/shared/icons";

meta: {
  cellInputVariant: "select",
  fieldType: "string",
  filterOptions: [
    {
      value: "urgent",
      label: "Urgent",
      icon: <Icons.alertCircle className="size-4 text-red-500" />
    },
    {
      value: "normal",
      label: "Normal",
      icon: <Icons.circle className="size-4 text-blue-500" />
    }
  ]
}
```

## Type Definitions

### InputVariant

All supported input types:

```typescript
type InputVariant =
  | "text"
  | "number"
  | "textArea"
  | "checkbox"
  | "switch"
  | "date"
  | "dateRange"
  | "select"
  | "multiSelect"
  | "range"
  | "skeleton";
```

### FieldType

Data type metadata:

```typescript
type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "array"
  | "subObject";
```

### ColumnMeta

Extended column metadata:

```typescript
interface ColumnMeta {
  cellInputVariant?: InputVariant;
  fieldType?: FieldType;
  filterOptions?: Option[];
  filterOptionsFn?: () => Promise<Option[]>;
}
```

### CustomFormFieldProps

Component props interface:

```typescript
interface CustomFormFieldProps<TData, TFieldValues extends FieldValues = any> {
  column: Column<TData, unknown>;
  control: Control<TFieldValues>;
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
    | "decimal";
}
```

## Advanced Usage

### Custom Validation

```typescript
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  priority: z.number().min(1).max(10),
  status: z.enum(["active", "pending", "completed"]),
  tags: z.array(z.string()).min(1, "At least one tag required")
});

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... }
});
```

### Conditional Fields

```typescript
function RowEditForm() {
  const status = form.watch("status");

  return (
    <>
      <DatatableCustomFormField
        column={statusColumn}
        control={form.control}
        name="status"
        label="Status"
      />

      {status === "completed" && (
        <DatatableCustomFormField
          column={completedDateColumn}
          control={form.control}
          name="completedDate"
          label="Completed Date"
        />
      )}
    </>
  );
}
```

### With Error Handling

```typescript
const onSubmit = async (data: FormValues) => {
  try {
    const result = await updateRow(data);

    if (result.status === "success") {
      toast.success("Row updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tableData"] });
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    console.error("Update failed:", error);
    toast.error("An unexpected error occurred");
  }
};
```

## Adding a New Input Variant

### Step 1: Add to Type Definition

```typescript
export type InputVariant =
  | "text"
  | "number"
  // ... existing variants
  | "yourNewVariant"; // Add your new variant
```

### Step 2: Check if it Needs Options

```typescript
const needsOptionsVariants: InputVariant[] = [
  "select",
  "multiSelect",
  "yourNewVariant", // Add if it needs option loading
];
```

### Step 3: Add to RenderInput Switch

```typescript
function RenderInput<TData, TFieldValues>({
  field,
  props,
  options,
  isLoading,
  isError,
  error
}) {
  // ... existing code

  switch (cellInputVariant) {
    // ... existing cases

    case "yourNewVariant":
      return (
        <YourCustomInput
          value={field.value}
          onChange={field.onChange}
          options={options}
          placeholder={props.placeholder}
          disabled={props.disabled}
        />
      );

    default:
      return null;
  }
}
```

### Step 4: Use in Column Definition

```typescript
{
  accessorKey: "customField",
  header: "Custom Field",
  meta: {
    cellInputVariant: "yourNewVariant",
    fieldType: "string",
    filterOptions: [...] // if needed
  }
}
```

## Performance Considerations

### Query Configuration

- **staleTime**: 5 minutes (prevents unnecessary refetches)
- **retry**: 2 attempts (balance between reliability and speed)
- **enabled**: Only true for select/multiSelect variants

### Optimization Tips

1. **Memoize Options**: If options are static, define them outside component

```typescript
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

meta: {
  filterOptions: STATUS_OPTIONS;
}
```

2. **Debounce Text Input**: Already handled for text inputs (300ms delay)

3. **Lazy Load Options**: Use `filterOptionsFn` for large option sets

```typescript
filterOptionsFn: async () => {
  // Only fetch when needed
  const response = await fetch("/api/options?limit=100");
  return response.json();
};
```

## Error Handling

### Loading State

Shows spinner for options-based inputs:

```tsx
<div className="flex items-center justify-center p-2">
  <Icons.spinner className="size-4 animate-spin text-muted-foreground" />
</div>
```

### Error State

Shows alert with error message:

```tsx
<Alert variant="destructive" className="p-2">
  <AlertDescription className="text-xs">
    {error?.message || "Failed to load options"}
  </AlertDescription>
</Alert>
```

### Retry Logic

Automatically retries failed option fetches twice with exponential backoff.

## Accessibility

- ✅ Semantic HTML structure
- ✅ Proper label associations with `htmlFor`
- ✅ Required field indicators (`*`)
- ✅ ARIA attributes in select components
- ✅ Keyboard navigation support
- ✅ Error message announcements via FormMessage

## Migration Guide

### From Old Version

**Before:**

```typescript
<DatatableCustomFormField
  column={column}
  control={form.control}
  name="status"
  label="Status"
/>
```

**After (No Changes Required):**

```typescript
<DatatableCustomFormField
  column={column}
  control={form.control}
  name="status"
  label="Status"
/>
```

The enhanced version is backward compatible. All existing implementations will continue to work with improved:

- Type safety
- Error handling
- Performance (no unnecessary loading states)
- Extensibility

## Best Practices

1. **Always Define Column Meta**: Specify `cellInputVariant` and `fieldType` for proper rendering

2. **Use Type-Safe Forms**: Leverage TypeScript with react-hook-form for compile-time safety

3. **Handle Async Errors**: Wrap `filterOptionsFn` in try-catch blocks

4. **Validate Input**: Use zod or similar schema validation library

5. **Memoize Static Options**: Define options outside components to prevent recreating arrays

6. **Test Edge Cases**: Verify behavior with empty options, loading states, and errors

7. **Provide Meaningful Labels**: Use clear, descriptive labels for accessibility

8. **Add Placeholders**: Help users understand expected input format

## Troubleshooting

### Issue: Options not loading

**Solution**: Check that `filterOptions` or `filterOptionsFn` is defined in column meta

### Issue: Loading state persists

**Solution**: Ensure `filterOptionsFn` returns a Promise and doesn't throw errors

### Issue: Type errors with form values

**Solution**: Define proper TypeScript interface for form values matching column accessorKeys

### Issue: Date picker not working

**Solution**: Verify `cellInputVariant: "date"` and `fieldType: "date"` are set

### Issue: Custom variant not rendering

**Solution**: Ensure variant is added to InputVariant type and switch statement

## Support

For issues, questions, or contributions, refer to the main project documentation or create an issue in the repository.

## License

See main project LICENSE file.
