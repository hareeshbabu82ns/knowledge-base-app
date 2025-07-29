# Copilot Instructions for HKBase - Knowledge Base App managing Finances

## Project Overview

HKBase is a full-stack financial knowledge base application built on NextJS that helps users manage and track financial records, expenses, and transactions. The application allows users to:

- Create and manage expense accounts and categories
- Track financial transactions with detailed metadata
- Manage loans and recurring payments
- Generate financial reports and visualizations
- Search and filter financial records
- Import/export financial data in multiple formats

The system provides a robust authentication system, role-based access control, and secure handling of sensitive financial data.

Basic next app created using command

```sh
npx create-next-app@latest . --typescript --tailwind --eslint --app --use-pnpm
```

### Prisma with MongoDB Best Practices

- **Strongly Typed JSON Fields**: Use TypeScript interfaces with Prisma.JsonValue for config fields:

  ```typescript
  // In your schema.prisma
  model ExpenseAccount {
    id          String        @id @default(auto()) @map("_id") @db.ObjectId
    name        String
    config      Json?         // For storing complex configuration
    // other fields...
  }

  // In your types
  interface AccountConfig {
    displayOptions: {
      showBalance: boolean;
      currency: string;
    };
    notificationSettings: {
      lowBalanceAlert: boolean;
      threshold: number;
    };
  }

  // In your component
  const account = await prisma.expenseAccount.findUnique({
    where: { id: accountId }
  });
  const config = account.config as unknown as AccountConfig;
  ```

- **Prisma Transactions**: Use for data consistency across operations:

  ```typescript
  const newTransaction = await prisma.$transaction(async (tx) => {
    // Update account balance
    const updatedAccount = await tx.account.update({
      where: { id: accountId },
      data: { balance: { decrement: amount } },
    });

    // Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        amount,
        accountId,
        description,
        date: new Date(),
      },
    });

    return transaction;
  });
  ```

- **Database Connection Management**: Maintain singleton pattern for Prisma client:

  ```typescript
  // lib/prisma.ts
  import { PrismaClient } from "@prisma/client";

  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  export const prisma = globalForPrisma.prisma || new PrismaClient();

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```

### TanStack Query Best Practices

- **Query Keys Structure**: Use consistent hierarchical structure:

  ```typescript
  // For accounts
  const accountsKey = ["accounts"] as const;
  const accountKey = (id: string) => ["accounts", id] as const;
  const accountTransactionsKey = (id: string) =>
    ["accounts", id, "transactions"] as const;

  // Example usage
  const { data: account } = useQuery({
    queryKey: accountKey(accountId),
    queryFn: () => fetchAccount(accountId),
  });
  ```

- **Extract Query Logic**: Create custom hooks for reusability:

  ```typescript
  // hooks/useAccounts.ts
  export function useAccounts() {
    return useQuery({
      queryKey: ["accounts"],
      queryFn: fetchAccounts,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  export function useAccount(id: string) {
    return useQuery({
      queryKey: ["accounts", id],
      queryFn: () => fetchAccount(id),
      enabled: !!id,
    });
  }
  ```

- **Optimistic UI Updates**: Implement consistent approach:

  ```typescript
  const mutation = useMutation({
    mutationFn: updateAccount,
    onMutate: async (newAccount) => {
      // Cancel related queries
      await queryClient.cancelQueries({
        queryKey: ["accounts", newAccount.id],
      });

      // Snapshot previous value
      const previousAccount = queryClient.getQueryData([
        "accounts",
        newAccount.id,
      ]);

      // Optimistically update
      queryClient.setQueryData(["accounts", newAccount.id], newAccount);

      // Return context with previous value
      return { previousAccount };
    },
    onError: (err, newAccount, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ["accounts", newAccount.id],
        context?.previousAccount,
      );
    },
    onSettled: (data, error, variables) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.id] });
    },
  });
  ```

### TanStack Table Optimizations

- **Server-Side Pagination**: Implement consistent pagination pattern:

  ```typescript
  // Server component or action
  export async function fetchPaginatedTransactions(
    page = 0,
    pageSize = 10,
    sorting?: SortingState,
    filtering?: FilterState,
  ) {
    const skip = page * pageSize;
    const orderBy =
      sorting?.length > 0
        ? { [sorting[0].id]: sorting[0].desc ? "desc" : "asc" }
        : undefined;

    const where = buildFilterConditions(filtering);

    const [transactions, totalCount] = await prisma.$transaction([
      prisma.transaction.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        include: { category: true, account: true },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      totalCount,
      pageCount: Math.ceil(totalCount / pageSize),
    };
  }

  // Client component
  function TransactionsTable() {
    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
    });

    const { data, isLoading } = useQuery({
      queryKey: ["transactions", pagination.pageIndex, pagination.pageSize],
      queryFn: () =>
        fetchPaginatedTransactions(pagination.pageIndex, pagination.pageSize),
    });

    // Table implementation...
  }
  ```

- **Memoize Component Parts**: Use memoization for columns and data:

  ```typescript
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => formatDate(row.getValue("date")),
      },
      // Other columns...
    ],
    [],
  );

  const table = useReactTable({
    data: data?.transactions ?? [],
    columns,
    pageCount: data?.pageCount ?? 0,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });
  ```

### MongoDB-Specific Optimizations

- **Indexing**: Add appropriate indexes via Prisma:

  ```prisma
  model Transaction {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    amount    Float
    date      DateTime
    accountId String   @db.ObjectId
    account   Account  @relation(fields: [accountId], references: [id])
    category  String?

    @@index([accountId])
    @@index([date])
    @@index([category])
  }
  ```

- **Data Validation**: Implement consistent validation:

  ```typescript
  const transactionSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
    date: z.date(),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().optional(),
    description: z.string().max(500, "Description too long"),
  });

  export async function createTransaction(data: unknown) {
    try {
      const validated = transactionSchema.parse(data);

      // Proceed with creating transaction
      const transaction = await prisma.transaction.create({
        data: validated,
      });

      return { status: "success", data: transaction };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          status: "error",
          error: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
        };
      }
      return { status: "error", error: "Failed to create transaction" };
    }
  }
  ```

### Authentication and Security

- **Role-Based Access Control**: Implement consistent RBAC:

  ```typescript
  // middleware.ts
  export async function middleware(req: NextRequest) {
    const session = await getServerSession();

    // Check authentication
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check authorization for protected routes
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }

  // In server actions
  export async function adminAction() {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    // Proceed with admin action
  }
  ```

- **Data Sanitization**: Implement input sanitization:

  ```typescript
  import { sanitize } from "isomorphic-dompurify";

  export function sanitizeInput(input: string): string {
    return sanitize(input);
  }

  // Usage in form submission
  const handleSubmit = async (formData: FormData) => {
    const description = sanitizeInput(formData.get("description") as string);
    // Process sanitized input
  };
  ```

### Code Organization

- **Standardize Action Functions**: Use consistent pattern:

  ```typescript
  // app/actions/transactions.ts
  "use server";

  import { z } from "zod";
  import { prisma } from "@/lib/prisma";
  import { auth } from "@/auth";

  export type ActionResponse<T = unknown> =
    | { status: "success"; data: T }
    | { status: "error"; error: string };

  const transactionSchema = z.object({
    // schema definition
  });

  export async function createTransaction(
    data: z.infer<typeof transactionSchema>,
  ): Promise<ActionResponse<Transaction>> {
    try {
      // Authenticate
      const session = await auth();
      if (!session) {
        return { status: "error", error: "Unauthorized" };
      }

      // Validate
      const validated = transactionSchema.parse(data);

      // Process
      const transaction = await prisma.transaction.create({
        data: {
          ...validated,
          userId: session.user.id,
        },
      });

      return { status: "success", data: transaction };
    } catch (error) {
      // Error handling
      return { status: "error", error: "Failed to create transaction" };
    }
  }
  ```

- **Extract Common Logic**: Create utilities for repeated patterns:

  ```typescript
  // lib/transaction-utils.ts
  export async function updateAccountBalance(
    accountId: string,
    amount: number,
    isDebit: boolean,
  ) {
    return prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          [isDebit ? "decrement" : "increment"]: Math.abs(amount),
        },
      },
    });
  }

  // Usage in action
  await updateAccountBalance(accountId, amount, true);
  ```

These best practices and optimizations will ensure your application is performant, maintainable, and follows a consistent pattern throughout the codebase.

basic next app created using command

```sh
npx create-next-app@latest . --typescript --tailwind --eslint --app --use-pnpm
```

## Technical Stack

### Core Technologies

- **Frontend Framework**: NextJS 14+ with App Router architecture
- **Language**: TypeScript 5.0+ (strict mode enabled)
- **Styling**: Tailwind CSS 3.3+ with custom configuration
- **Database ORM**: Prisma with MongoDB
- **Form Management**: react-hook-form v7+ with zod validation
- **Theme Management**: next-themes for dark/light mode support
- **UI Component Library**: Shadcn for React components
- **State Management**: React Context API and React Query v5+
- **Server Actions**: using TanStack Query for server actions with async function call with type safety and error handling

## Architecture

### Folder Structure

```
hkbase/
├── app/                    # App Router routes
│   ├── (app)/              # App routes
│      ├── dashboard/       # Dashboard routes
│      ├── expenses/        # Financial Expenses routes
│      ├── loans/           # Loans routes
│      ├── settings/        # App Settings routes
│   ├── (auth)/             # Auth routes
│      ├── sign-in/         # Signin routes
│   ├── api/                # API routes
│      ├── auth/            # auth routes
│      ├── upload/          # upload routes
│   └── ...
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   └── features/           # Feature-specific components
├── lib/                    # Utility functions and shared code
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── config/                 # App configuration
└── public/                 # Static assets
```

### Development Requirements

- ESLint with typescript-eslint plugin
- Prettier for code formatting
- Prefer code splitting and small reusable components rather single big components
- Husky for git hooks
- Jest and React Testing Library for tests

## TypeScript Best Practices

### Type Safety

- Use `strict: true` in tsconfig.json
- Avoid `any` type instead use `unknown` when type is uncertain
- Leverage TypeScript utility types: `Partial<T>`, `Pick<T>`, `Omit<T>`, `Record<K,T>`
- Create type guards for runtime type checking:
  ```typescript
  function isOcrResultType(value: unknown): value is OcrResultType {
    return Object.values(OcrResultType).includes(value as OcrResultType);
  }
  ```
- always create functions with typesafe parameters

```typescript
interface DocumentPreviewCardParams {
  title: string;
  description: string;
  confidence: number;
}
function DocumentPreviewCard({
  title,
  description,
  confidence,
}: DocumentPreviewCardParams) {}
```

- Use discriminated unions for state management:
  ```typescript
  type OcrProcessState =
    | { status: "idle" }
    | { status: "processing" }
    | { status: "error"; error: Error }
    | { status: "success"; data: OcrResult };
  ```

### Server Actions using TanStack Query

- Define server actions in dedicated files within the `app/actions` directory
- Use TypeScript for type-safe server actions and response types
- Implement TanStack Query's `useMutation` for client-side interaction
- Follow this pattern for type-safe server actions:

  ```typescript
  // app/actions/ocr-actions.ts
  "use server";

  import { z } from "zod";
  import { db } from "@/lib/db";

  // Define response types using discriminated unions
  export type OcrActionResponse<T = unknown> =
    | { status: "success"; data: T }
    | { status: "error"; error: string };

  // Define validation schema
  const UploadDocumentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1).max(100),
    fileUrl: z.string().url(),
    language: z.string().default("eng"),
    enhanceImage: z.boolean().default(false),
    confidenceThreshold: z.number().min(0).max(100).default(80),
    pageRange: z.string().optional(),
  });

  // Type-safe server action
  export async function uploadDocument(
    data: z.infer<typeof UploadDocumentSchema>,
  ): Promise<OcrActionResponse<Document>> {
    try {
      // Validate input
      const validated = UploadDocumentSchema.parse(data);

      // OCR processing would happen here
      // ...processing logic...

      // Database operation
      const document = await db.document.create({
        data: {
          name: validated.name,
          fileUrl: validated.fileUrl,
          language: validated.language,
          status: "PROCESSED",
          userId: "current-user-id", // In production, get from auth
        },
      });

      return { status: "success", data: document };
    } catch (error) {
      console.error("Document processing failed:", error);

      if (error instanceof z.ZodError) {
        return {
          status: "error",
          error: `Validation error: ${error.errors
            .map((e) => e.message)
            .join(", ")}`,
        };
      }

      return { status: "error", error: "Failed to process document" };
    }
  }
  ```

- Client-side implementation with TanStack Query:

  ```typescript
  // components/features/ocr/process-document-form.tsx
  "use client";

  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { uploadDocument } from "@/app/actions/ocr-actions";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";
  import { toast } from "@/components/ui/toast";

  // Match the schema used in server action
  const formSchema = z.object({
    name: z.string().min(1, "Document name is required").max(100),
    fileUrl: z.string().url("Valid file URL is required"),
    language: z.string().default("eng"),
    enhanceImage: z.boolean().default(false),
    confidenceThreshold: z.number().min(0).max(100).default(80),
    pageRange: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  export function UploadDocumentForm() {
    const queryClient = useQueryClient();
    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        fileUrl: "",
        language: "eng",
        enhanceImage: false,
        confidenceThreshold: 80,
      },
    });

    // Setup mutation with proper typing
    const mutation = useMutation({
      mutationFn: processDocument,
      onSuccess: (data) => {
        if (data.status === "success") {
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ["documents"] });
          toast.success("Document processed successfully");
        } else {
          // Handle validation or other expected errors
          toast.error(data.error);
        }
      },
      onError: (error: Error) => {
        // Handle unexpected errors
        console.error("OCR processing error:", error);
        toast.error("An unexpected error occurred during processing");
      },
    });

    const onSubmit = (values: FormValues) => {
      mutation.mutate(values);
    };

    return (
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields... */}
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Processing..." : "Process Document"}
        </button>

        {mutation.isError && (
          <div className="text-red-500">
            {mutation.error.message || "An error occurred"}
          </div>
        )}
      </form>
    );
  }
  ```

- Type guard for response handling as client side utility:

  ```typescript
  // Type guard to check successful response
  function isSuccessResponse<T>(
    response: OcrActionResponse<T>,
  ): response is { status: "success"; data: T } {
    return response.status === "success";
  }

  // Usage example in a component or hook
  import { isSuccessResponse, isErrorResponse } from "@/lib/response-utils";
  import { processServerAction } from "@/app/actions/sample-actions";

  const handleSubmit = async (formData) => {
    const result = await processServerAction(formData);

    if (isSuccessResponse(result)) {
      // TypeScript knows result.data is available here
      router.push(`/path/${result.data.id}`);
    } else {
      // TypeScript knows result.error is available here
      setError(result.error);
      // or throw new Error(result.error);
    }
  };
  ```

- Error handling with TanStack Query's error boundaries:

  ```typescript
  import { QueryErrorResetBoundary } from "@tanstack/react-query";
  import { ErrorBoundary } from "react-error-boundary";

  function DocumentProcessingPage() {
    return (
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="error-container">
                <h2>Something went wrong during OCR processing!</h2>
                <pre>{error.message}</pre>
                <button onClick={() => resetErrorBoundary()}>Try again</button>
              </div>
            )}
          >
            <DocumentProcessingContent />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    );
  }
  ```

### Form Implementation

- Use `react-hook-form` with zod validation for OCR processing forms
- Implement controlled inputs with immediate feedback for OCR parameters
- Persist form state during navigation between document pages
- Add auto-save functionality for document editing sessions
- Example pattern for OCR processing form:

  ```typescript
  interface OcrProcessFormValues {
    documentName: string;
    ocrLanguage: string;
    confidenceThreshold: number;
    enhanceImage: boolean;
    pageSelection: "all" | "custom";
    customPageRange?: string;
    // other OCR-specific fields...
  }

  const ocrProcessFormSchema = z.object({
    documentName: z.string().min(1, "Document name is required").max(100),
    ocrLanguage: z.string().min(1, "OCR language is required").default("eng"),
    confidenceThreshold: z.number().min(0).max(100).default(80),
    enhanceImage: z.boolean().default(false),
    pageSelection: z.enum(["all", "custom"]).default("all"),
    customPageRange: z
      .string()
      .optional()
      .refine((val) => !val || /^(\d+)(-\d+)?(,\s*\d+(-\d+)?)*$/.test(val), {
        message: "Invalid page range format (e.g. 1-3,5,7-9)",
      }),
    // other validations...
  });

  function OcrProcessForm() {
    const form = useForm<OcrProcessFormValues>({
      resolver: zodResolver(ocrProcessFormSchema),
      defaultValues: {
        documentName: "",
        ocrLanguage: "eng",
        confidenceThreshold: 80,
        enhanceImage: false,
        pageSelection: "all",
      },
    });

    // Form implementation with OCR-specific logic...
  }
  ```

### React/NextJS Performance Optimization

- Avoid unnecessary re-renders:

  ```typescript
  // Use memo for expensive calculations
  const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

  // Use useCallback for functions passed as props
  const memoizedCallback = useCallback(() => {
    doSomething(count);
  }, [count]);

  // Use memo for components that render often
  const MemoizedComponent = memo(MyComponent);
  ```

- Implement proper key strategies for lists:

  ```typescript
  // Good: Using unique IDs
  {
    items.map((item) => <ListItem key={item.id} {...item} />);
  }

  // Bad: Using index as key when list order changes
  {
    items.map((item, index) => <ListItem key={index} {...item} />);
  }
  ```

- Implement debouncing for search inputs and frequent events:

  ```typescript
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }
  ```

### Responsive Design Specifications

- Mobile-first approach using Tailwind breakpoints
- Layouts:
  - Mobile (< 640px): Single column, collapsible sections
  - Tablet (640px - 1024px): Two columns, sidebar navigation
  - Desktop (> 1024px): Three columns, full dashboard view
- Touch targets minimum 44×44 pixels on mobile
- Swipe gestures for common actions on mobile

### Error Handling

- Form validation errors with field-level feedback
- API error responses with typed error objects:

  ```typescript
  // Define error types
  type ApiError =
    | { code: "UNAUTHORIZED"; message: string }
    | {
        code: "VALIDATION_ERROR";
        message: string;
        fields: Record<string, string>;
      }
    | { code: "SERVER_ERROR"; message: string };

  // Type-safe error handling
  try {
    const data = await apiCall();
    // Handle success
  } catch (error) {
    if (isApiError(error)) {
      switch (error.code) {
        case "UNAUTHORIZED":
          // Handle unauthorized
          break;
        case "VALIDATION_ERROR":
          // Handle validation errors with field specificity
          break;
        case "SERVER_ERROR":
          // Handle server error
          break;
      }
    }
  }
  ```

- Global error boundary components
- Fallback UI components for each major feature
- Offline detection and data synchronization

### Accessibility Requirements

- WCAG 2.1 AA compliance target
- Semantic HTML structure throughout
- ARIA attributes for all interactive elements
- Focus management for modals and dialogs
- Keyboard navigation support (tab order, shortcuts)
- Minimum contrast ratio of 4.5:1 for all text
- Screen reader compatible components

## Performance Optimization

- Component code splitting with dynamic imports
- Image optimization with Next/Image
- Incremental Static Regeneration where applicable
- Memoization of expensive calculations
- Virtualized lists for large datasets
- Optimistic UI updates for immediate feedback
- Minimum contrast ratio of 4.5:1 for text
