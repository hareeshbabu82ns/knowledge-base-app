# Copilot Project Template: Full-Stack Next.js Application

## Overview

This comprehensive instruction set provides a blueprint for creating production-ready Next.js 15+ applications with authentication, database integration, and modern UI components using GitHub Copilot agents. This template excludes business-specific logic but includes all foundational architecture.

---

## Table of Contents

1. [Project Initialization](#1-project-initialization)
2. [Core Configuration Files](#2-core-configuration-files)
3. [Database Setup with Prisma](#3-database-setup-with-prisma)
4. [Authentication System](#4-authentication-system)
5. [UI Component Library](#5-ui-component-library)
6. [Application Structure](#6-application-structure)
7. [Data Management](#7-data-management)
8. [File Upload System](#8-file-upload-system)
9. [Development Workflow](#9-development-workflow)
10. [Deployment Configuration](#10-deployment-configuration)

---

## 1. Project Initialization

### 1.1 Create Next.js Application

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --use-pnpm
```

**Configuration Choices:**

- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ ESLint
- ✅ App Router
- ✅ `src/` directory: No
- ✅ Import alias (@/\*): Yes

### 1.2 Install Core Dependencies

```bash
pnpm add next-auth@5.0.0-beta.27 @auth/prisma-adapter @prisma/client
pnpm add react-hook-form @hookform/resolvers zod
pnpm add @tanstack/react-query @tanstack/react-table
pnpm add next-themes class-variance-authority clsx tailwind-merge
pnpm add bcryptjs date-fns lucide-react
pnpm add jotai sonner

pnpm add -D prisma @types/node @types/react @types/react-dom
pnpm add -D @tailwindcss/container-queries prettier
```

### 1.3 Install Radix UI Components

```bash
pnpm add @radix-ui/react-accordion @radix-ui/react-alert-dialog
pnpm add @radix-ui/react-avatar @radix-ui/react-checkbox
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add @radix-ui/react-label @radix-ui/react-popover
pnpm add @radix-ui/react-select @radix-ui/react-separator
pnpm add @radix-ui/react-slot @radix-ui/react-switch
pnpm add @radix-ui/react-tabs @radix-ui/react-toast
pnpm add @radix-ui/react-tooltip @radix-ui/react-scroll-area
```

---

## 2. Core Configuration Files

### 2.1 TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2.2 Next.js Configuration (`next.config.ts`)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // Enable during builds for production
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
```

### 2.3 ESLint Configuration (`eslint.config.mjs`)

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "dist/*",
      ".cache/*",
      "public/*",
      "node_modules/*",
      "*.esm.js",
      "data/*",
      "components/ui/*",
      "app/generated/*",
      ".next/*",
    ],
  },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "tailwindcss/no-custom-classname": "off",
    },
  }),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
```

### 2.4 Shadcn UI Configuration (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 2.5 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:gen": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "release:patch": "pnpm version patch && git push && git push --tags",
    "release:minor": "pnpm version minor && git push && git push --tags",
    "release:major": "pnpm version major && git push && git push --tags"
  }
}
```

### 2.6 Environment Variables (`.env.sample`)

```bash
# Application
DATA_FOLDER=./data
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-auth-secret-here"
TOTP_ENCRYPTION_KEY="your-totp-encryption-key-here"

# Database
DATABASE_URL="mongodb+srv://user:password@host.mongodb.net/dbname?retryWrites=true&w=majority"

# OAuth Providers (Optional)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Email Provider (Optional)
AUTH_RESEND_KEY="your-resend-api-key"
SMTP_FROM="noreply@yourdomain.com"

# Admin Configuration
ADMIN_EMAILS="admin@yourdomain.com,manager@yourdomain.com"
```

### 2.7 Git Ignore (`.gitignore`)

```ignore
# Dependencies
/node_modules
/.pnp
.pnp.js

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env*.local
.env

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Application
/data
/app/generated/
```

---

## 3. Database Setup with Prisma

### 3.1 Initialize Prisma

```bash
pnpm prisma init
```

### 3.2 Base Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

// Enums
enum UserRole {
  USER
  ADMIN
}

// Authentication Models
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          UserRole  @default(USER)

  // Relationships
  accounts      Account[]
  sessions      Session[]
  Authenticator Authenticator[]

  // TOTP (Two-Factor Authentication)
  totpSecret      String?   // Encrypted TOTP secret
  totpEnabled     Boolean   @default(false)
  totpBackupCodes String[]  @default([])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.String
  access_token      String? @db.String
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.String
  session_state     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

model Authenticator {
  credentialID         String  @id @map("_id")
  userId               String  @db.ObjectId
  providerAccountId    String
  credentialPublicKey  String
  counter              Int
  credentialDeviceType String
  credentialBackedUp   Boolean
  transports           String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, credentialID])
}
```

### 3.3 Prisma Client Setup (`lib/db/index.ts`)

```typescript
import { PrismaClient } from "@/app/generated/prisma";

declare const global: {
  db: PrismaClient | undefined;
};

export const db: PrismaClient =
  global.db ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.db = db;
```

### 3.4 Generate Prisma Client

```bash
pnpm db:gen
```

---

## 4. Authentication System

### 4.1 Auth Configuration (`lib/auth/utils.ts`)

```typescript
import { type UserRole } from "@/app/generated/prisma";
import { type DefaultSession, NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    image?: string;
  }
}

export const authOptionsPartial: NextAuthConfig = {
  providers: [],
  basePath: "/api/auth",
  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/",
    error: "/sign-in",
  },
};
```

### 4.2 Main Auth Configuration (`lib/auth/index.ts`)

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthConfig } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { authOptionsPartial } from "@/lib/auth/utils";
import { db } from "@/lib/db";

export const authOptions: NextAuthConfig = {
  ...authOptionsPartial,
  adapter: PrismaAdapter(db) as Adapter,

  providers: [
    ...authOptionsPartial.providers,
    GoogleProvider,
    GitHubProvider,
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const dbUser = await db.user.findFirst({
          where: { email: credentials.email as string },
        });

        if (!dbUser || !dbUser.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          dbUser.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          image: dbUser.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
```

### 4.3 Middleware (`middleware.ts`)

```typescript
import NextAuth from "next-auth";
import { authOptionsPartial } from "@/lib/auth/utils";

const { auth } = NextAuth(authOptionsPartial);

export const apiRoutePrefix = "/api/auth";
export const publicRoutes = ["/", "/sign-in", "/sign-up"];
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const queryParams = nextUrl.searchParams;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiRoutePrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }

  if (
    isLoggedIn &&
    (nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/sign-up")
  ) {
    const from =
      queryParams.get("from") ||
      queryParams.get("callbackUrl") ||
      DEFAULT_LOGIN_REDIRECT;
    return Response.redirect(new URL(decodeURIComponent(from), nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return Response.redirect(
      new URL(`/sign-in?callbackUrl=${callbackUrl}`, nextUrl),
    );
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 4.4 Auth Actions (`lib/auth/actions.ts`)

```typescript
"use server";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "@/lib/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { AuthError } from "next-auth";

export async function signIn(
  provider: string,
  formData?: FormData,
  callbackUrl?: string,
) {
  try {
    await nextAuthSignIn(provider, {
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
      ...Object.fromEntries(formData || []),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}

export async function signOut() {
  await nextAuthSignOut({ redirectTo: "/" });
}
```

### 4.5 Routes Configuration (`config/routes.ts`)

```typescript
export const publicRoutes = ["/", "/sign-in", "/sign-up"];
export const privateRoutes = ["/dashboard", "/settings", "/profile"];
export const apiRoutePrefix = "/api/auth";
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
```

---

## 5. UI Component Library (Shadcn UI)

Shadcn UI is a collection of beautifully designed, accessible, and customizable components built with Radix UI and Tailwind CSS. Unlike traditional UI libraries, Shadcn UI components are copied directly into your project, giving you full control.

### 5.1 Install Shadcn UI CLI

```bash
pnpm dlx shadcn@latest init
```

**Configuration prompts:**

- Style: Default
- Base color: Slate (or your preference)
- CSS variables: Yes
- React Server Components: Yes
- TypeScript: Yes

### 5.2 Component Categories and Installation

#### 5.2.1 Essential Components (Core UI)

```bash
# Basic interaction components
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add radio-group
pnpm dlx shadcn@latest add switch

# Layout components
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add scroll-area
pnpm dlx shadcn@latest add aspect-ratio

# Typography & content
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add avatar
```

#### 5.2.2 Form Components

```bash
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add slider
pnpm dlx shadcn@latest add calendar
pnpm dlx shadcn@latest add date-picker
pnpm dlx shadcn@latest add command
pnpm dlx shadcn@latest add combobox
pnpm dlx shadcn@latest add toggle
pnpm dlx shadcn@latest add toggle-group
```

#### 5.2.3 Overlay Components

```bash
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add alert-dialog
pnpm dlx shadcn@latest add sheet
pnpm dlx shadcn@latest add popover
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add context-menu
pnpm dlx shadcn@latest add menubar
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add hover-card
```

#### 5.2.4 Navigation Components

```bash
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add navigation-menu
pnpm dlx shadcn@latest add breadcrumb
pnpm dlx shadcn@latest add pagination
```

#### 5.2.5 Feedback Components

```bash
pnpm dlx shadcn@latest add toast
pnpm dlx shadcn@latest add alert
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add sonner  # Enhanced toast notifications
```

#### 5.2.6 Data Display Components

```bash
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add accordion
pnpm dlx shadcn@latest add collapsible
pnpm dlx shadcn@latest add carousel
```

#### 5.2.7 Advanced Components

```bash
pnpm dlx shadcn@latest add data-table
pnpm dlx shadcn@latest add resizable
pnpm dlx shadcn@latest add drawer
pnpm dlx shadcn@latest add chart
```

### 5.3 Utility Functions (`lib/utils.ts`)

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5.4 Font Configuration (`lib/fonts.ts`)

```typescript
import {
  JetBrains_Mono as FontMono,
  Inter as FontSans,
} from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
```

### 5.5 Global Styles (`app/globals.css`)

```css
@import "tailwindcss";

:root {
  --background: hsl(212 85% 95%);
  --foreground: hsl(212 5% 10%);
  --card: hsl(212 50% 90%);
  --card-foreground: hsl(212 5% 15%);
  --popover: hsl(212 85% 95%);
  --popover-foreground: hsl(212 95% 10%);
  --primary: hsl(212 79% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(212 30% 70%);
  --secondary-foreground: hsl(0 0% 0%);
  --muted: hsl(174 30% 85%);
  --muted-foreground: hsl(212 5% 40%);
  --accent: hsl(174 30% 80%);
  --accent-foreground: hsl(212 5% 15%);
  --destructive: hsl(0 85% 49%);
  --destructive-foreground: hsl(212 5% 90%);
  --success: hsl(120 55% 40%);
  --success-foreground: hsl(120 5% 95%);
  --warning: hsl(40 65% 40%);
  --warning-foreground: hsl(40 5% 95%);
  --border: hsl(212 30% 50%);
  --input: hsl(212 30% 49%);
  --ring: hsl(212 79% 45%);
  --radius: 0.4rem;
}

.dark {
  --background: hsl(212 50% 10%);
  --foreground: hsl(212 5% 90%);
  --card: hsl(212 50% 10%);
  --card-foreground: hsl(212 5% 90%);
  --popover: hsl(212 50% 5%);
  --popover-foreground: hsl(212 5% 90%);
  --primary: hsl(212 79% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(212 30% 20%);
  --secondary-foreground: hsl(0 0% 100%);
  --muted: hsl(174 30% 25%);
  --muted-foreground: hsl(212 5% 60%);
  --accent: hsl(174 30% 25%);
  --accent-foreground: hsl(212 5% 90%);
  --destructive: hsl(0 85% 49%);
  --destructive-foreground: hsl(212 5% 90%);
  --border: hsl(212 30% 49%);
  --input: hsl(212 30% 49%);
  --ring: hsl(212 79% 45%);
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### 5.6 Shadcn UI Component Usage Examples

#### 5.6.1 Button Component

```tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Icons.plus className="h-4 w-4" />
</Button>

// States
<Button disabled>Disabled</Button>
<Button>
  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
  Loading
</Button>

// As Link
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

#### 5.6.2 Card Component

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

#### 5.6.3 Form with React Hook Form

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

#### 5.6.4 Dialog Component

```tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### 5.6.5 Dropdown Menu

```tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 5.6.6 Select Component

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

// With Form
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>;
```

#### 5.6.7 Table Component

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  // ... more data
];

export function TableDemo() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
```

#### 5.6.8 Toast Notifications (Sonner)

```tsx
"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ToastDemo() {
  return (
    <div className="space-x-2">
      <Button onClick={() => toast("Event has been created")}>
        Show Toast
      </Button>

      <Button onClick={() => toast.success("Event has been created")}>
        Success
      </Button>

      <Button onClick={() => toast.error("Something went wrong")}>Error</Button>

      <Button onClick={() => toast.warning("Warning message")}>Warning</Button>

      <Button
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        With Action
      </Button>

      <Button
        onClick={() =>
          toast.promise(
            fetch("/api/data").then((res) => res.json()),
            {
              loading: "Loading...",
              success: (data) => `${data.name} has been added`,
              error: "Error loading data",
            },
          )
        }
      >
        Promise
      </Button>
    </div>
  );
}
```

#### 5.6.9 Tabs Component

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
```

#### 5.6.10 Alert Dialog

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => console.log("Deleted")}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### 5.6.11 Sheet (Slide-over)

```tsx
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Different sides
<SheetContent side="top">...</SheetContent>
<SheetContent side="bottom">...</SheetContent>
<SheetContent side="left">...</SheetContent>
<SheetContent side="right">...</SheetContent> // default
```

#### 5.6.12 Accordion

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components'
          aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It's animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// Multiple items open at once
<Accordion type="multiple" className="w-full">
  {/* ... */}
</Accordion>;
```

#### 5.6.13 Popover

```tsx
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

#### 5.6.14 Date Picker

```tsx
"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// With Form
<FormField
  control={form.control}
  name="dob"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Date of birth</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !field.value && "text-muted-foreground",
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>;
```

#### 5.6.15 Command Menu (Search/Command Palette)

```tsx
"use client";

import * as React from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandDialogDemo() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Press{" "}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile className="mr-2 h-4 w-4" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

#### 5.6.16 Skeleton Loading

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

// Card skeleton
export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );
}
```

#### 5.6.17 Badge Component

```tsx
import { Badge } from "@/components/ui/badge";

export function BadgeDemo() {
  return (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}

// Custom badge
<Badge className="bg-green-500">
  Active
</Badge>

// With icon
<Badge>
  <CheckCircle className="mr-1 h-3 w-3" />
  Verified
</Badge>
```

#### 5.6.18 Avatar Component

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}

// Multiple sizes
<div className="flex gap-2">
  <Avatar className="h-8 w-8">
    <AvatarImage src="/user.jpg" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <Avatar className="h-10 w-10">
    <AvatarImage src="/user.jpg" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <Avatar className="h-12 w-12">
    <AvatarImage src="/user.jpg" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
</div>;
```

### 5.7 Custom Icon Component

Create a centralized icon component for consistent icon usage:

**`components/shared/icons.tsx`**

```tsx
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  Loader2,
  LucideProps,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  X,
} from "lucide-react";

export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertCircle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  twitter: Twitter,
  check: Check,
  // Add custom SVG icons
  gitHub: (props: LucideProps) => (
    <svg viewBox="0 0 438.549 438.549" {...props}>
      <path
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408..."
      />
    </svg>
  ),
};
```

### 5.8 Theme Toggle Component

```tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 6. Application Structure

### 6.1 Root Layout (`app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import { fontSans, fontMono } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          fontSans.variable,
          fontMono.variable,
          "min-h-screen antialiased bg-background text-foreground",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main id="skip">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 6.2 Providers Component (`components/providers.tsx`)

```tsx
"use client";

import * as React from "react";
import { Provider as JotaiProvider } from "jotai";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider {...props}>
          <TooltipProvider delayDuration={1000}>
            <ShadcnToaster />
            <Toaster position="top-center" richColors />
            {children}
          </TooltipProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
```

### 6.3 Site Configuration (`config/site.ts`)

```typescript
export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  address: string;
  links: {
    email: string;
    tel: string;
    twitter: string;
    github: string;
    docs: string;
  };
  defaultUserImg: string;
  mainNav: {
    title: string;
    href: string;
  }[];
};

export const siteConfig: SiteConfig = {
  name: "Your App Name",
  description: "Your app description",
  url: "https://yourdomain.com",
  address: "Your Location",
  links: {
    email: "contact@yourdomain.com",
    tel: "1234567890",
    twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/yourusername/yourrepo",
    docs: "https://yourdomain.com/docs",
  },
  defaultUserImg: "/default-user.png",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Profile",
      href: "/profile",
    },
    {
      title: "Settings",
      href: "/settings",
    },
  ],
};
```

### 6.4 App Layout (`app/(app)/layout.tsx`)

```tsx
import NextAuthProvider from "@/components/auth/Provider";
import WithDefaultLayout from "@/components/layout/default-layout";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextAuthProvider>
      <WithDefaultLayout>{children}</WithDefaultLayout>
    </NextAuthProvider>
  );
}
```

### 6.5 Auth Provider (`components/auth/Provider.tsx`)

```tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

export default function NextAuthProvider({ children }: PropsWithChildren) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 6.6 Default Layout (`components/layout/default-layout.tsx`)

```tsx
"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import { usePathname } from "next/navigation";
import { routes } from "@/components/routes";
import React from "react";
import Navbar from "@/components/navbar/NavbarAdmin";
import { getActiveRoute } from "@/utils/navigation";

const WithDefaultLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex size-full">
      <Sidebar routes={routes} open={open} setOpen={() => setOpen(!open)} />
      <div className="flex size-full flex-col xl:ml-80">
        <Navbar
          onOpen={() => setOpen(!open)}
          brandText={getActiveRoute(routes, pathname)}
        />
        <main className="mx-2.5 flex-none transition-all md:mx-4">
          <div className="@container/main-content min-h-screen overflow-y-auto p-2 md:p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WithDefaultLayout;
```

### 6.7 Navigation Utilities (`utils/navigation.tsx`)

```tsx
import { IRoute } from "@/types/types";

export function getActiveRoute(routes: IRoute[], pathname: string): string {
  let activeRoute = "Dashboard";

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];

    if (pathname.includes(route.layout + route.path)) {
      return route.name;
    } else if (route.items) {
      const found = getActiveRoute(route.items, pathname);
      if (found !== activeRoute) {
        return found;
      }
    }
  }

  return activeRoute;
}

export function getActiveNavbar(routes: IRoute[], pathname: string): boolean {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];

    if (pathname.includes(route.layout + route.path)) {
      return route.secondary || false;
    } else if (route.items) {
      const found = getActiveNavbar(route.items, pathname);
      if (found) {
        return found;
      }
    }
  }

  return false;
}
```

### 6.8 Route Types (`types/types.ts`)

```typescript
export interface IRoute {
  name: string;
  layout?: string;
  path: string;
  icon?: JSX.Element | string;
  collapse?: boolean;
  items?: IRoute[];
  rightElement?: boolean;
  secondary?: boolean;
  invisible?: boolean;
}
```

---

## 7. Data Management

### 7.1 Server Actions Pattern

Create action files in `app/actions/` following this pattern:

**`app/actions/example-actions.ts`**

```typescript
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Standard response type
export type ActionResponse<T = unknown> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// Define validation schema
const exampleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
});

/**
 * Create example record
 */
export async function createExample(
  data: z.infer<typeof exampleSchema>,
): Promise<ActionResponse<{ id: string; name: string }>> {
  try {
    // Authenticate
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    // Validate input
    const validated = exampleSchema.parse(data);

    // Database operation
    const result = await db.example.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    revalidatePath("/examples");
    return { status: "success", data: result };
  } catch (error) {
    console.error("Create example failed:", error);

    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.issues.map((e) => e.message).join(", ")}`,
      };
    }

    return { status: "error", error: "Failed to create example" };
  }
}

/**
 * Get all examples (with pagination)
 */
export async function getExamples(params?: {
  page?: number;
  pageSize?: number;
}): Promise<
  ActionResponse<{
    items: Array<{ id: string; name: string }>;
    total: number;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    const { page = 0, pageSize = 10 } = params || {};
    const skip = page * pageSize;

    const [items, total] = await db.$transaction([
      db.example.findMany({
        where: { userId: session.user.id },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.example.count({
        where: { userId: session.user.id },
      }),
    ]);

    return { status: "success", data: { items, total } };
  } catch (error) {
    console.error("Get examples failed:", error);
    return { status: "error", error: "Failed to fetch examples" };
  }
}
```

### 7.2 TanStack Query Usage

**Custom Hook (`hooks/use-examples.ts`)**

```typescript
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExample, getExamples } from "@/app/actions/example-actions";
import { toast } from "sonner";

export const EXAMPLES_QUERY_KEY = ["examples"] as const;

export function useExamples(page = 0, pageSize = 10) {
  return useQuery({
    queryKey: [...EXAMPLES_QUERY_KEY, page, pageSize],
    queryFn: () => getExamples({ page, pageSize }),
  });
}

export function useCreateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExample,
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: EXAMPLES_QUERY_KEY });
        toast.success("Example created successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "An unexpected error occurred");
    },
  });
}
```

### 7.3 Validation Schemas (`lib/validations/`)

Create validation schemas in separate files:

**`lib/validations/user.ts`**

```typescript
import * as z from "zod";
import { siteConfig } from "@/config/site";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(5).max(100),
  email: z.string().email(),
  image: z.string().default(siteConfig.defaultUserImg).optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export const UserInputSchema = UserSchema.omit({ id: true });

export const UserSigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const UserSignupSchema = z.object({
  name: z.string().min(5).max(100),
  email: z.string().email(),
  password: z.string().min(6),
});
```

---

## 8. File Upload System

### 8.1 Upload API Route (`app/api/upload/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "data/uploads");

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
```

### 8.2 File Upload Component (`components/shared/single-file-upload-form.tsx`)

```tsx
"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { toast } from "sonner";

interface FileUploadFormProps {
  onUploadComplete?: (url: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function SingleFileUploadForm({
  onUploadComplete,
  accept = { "image/*": [] },
  maxSize = 5 * 1024 * 1024, // 5MB
}: FileUploadFormProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      toast.success("File uploaded successfully");
      onUploadComplete?.(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <p>Uploading...</p>
        </div>
      ) : isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Icons.upload className="h-8 w-8" />
          <p>Drag & drop a file here, or click to select</p>
        </div>
      )}
    </div>
  );
}
```

---

## 9. Development Workflow

### 9.1 Initial Setup Commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:gen

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### 9.2 Database Workflow

```bash
# Make changes to schema.prisma, then:
pnpm db:gen        # Generate Prisma Client
pnpm db:migrate    # Create and apply migrations
pnpm db:studio     # Open Prisma Studio (database GUI)
```

### 9.3 Code Quality

```bash
# Run linter
pnpm lint

# Format code (if using Prettier)
pnpm format
```

---

## 10. Deployment Configuration

### 10.1 Dockerfile

```dockerfile
FROM node:23-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create uploads directory
RUN mkdir -p /app/data/uploads

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN \
  if [ -f yarn.lock ]; then yarn run db:gen; \
  elif [ -f package-lock.json ]; then npm run db:gen; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run db:gen; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Build Next.js
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 10.2 Docker Compose (Optional)

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    volumes:
      - ./data:/app/data
```

---

## Quick Start Checklist

### Phase 1: Initial Setup

- [ ] Create Next.js project with TypeScript
- [ ] Install all dependencies
- [ ] Configure TypeScript, ESLint, and Prettier
- [ ] Set up Shadcn UI
- [ ] Create environment variables file

### Phase 2: Database & Auth

- [ ] Initialize Prisma
- [ ] Create base database schema
- [ ] Generate Prisma Client
- [ ] Configure NextAuth
- [ ] Implement middleware
- [ ] Create auth actions

### Phase 3: UI Foundation

- [ ] Install Shadcn components
- [ ] Set up global styles
- [ ] Create layout components
- [ ] Build navigation system
- [ ] Implement theme provider

### Phase 4: Data Layer

- [ ] Create server action patterns
- [ ] Set up TanStack Query
- [ ] Create validation schemas
- [ ] Build reusable hooks

### Phase 5: Features

- [ ] Implement file upload
- [ ] Create user profile management
- [ ] Build settings page
- [ ] Add data tables

### Phase 6: Polish

- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Responsive design
- [ ] Accessibility

### Phase 7: Deployment

- [ ] Create Dockerfile
- [ ] Configure environment for production
- [ ] Test build
- [ ] Deploy

---

## Best Practices Summary

### TypeScript

- Use strict mode
- Avoid `any` types
- Create proper type definitions
- Use discriminated unions for state

### Server Actions

- Always validate input with Zod
- Return typed responses (`ActionResponse<T>`)
- Handle errors gracefully
- Revalidate paths after mutations

### React Query

- Create custom hooks for queries
- Use consistent query keys
- Implement optimistic updates
- Handle loading and error states

### Database

- Use Prisma transactions for related operations
- Index frequently queried fields
- Use proper relationships
- Handle soft deletes where needed

### Security

- Validate all user input
- Sanitize data before display
- Use CSRF protection
- Implement rate limiting
- Secure file uploads

### Performance

- Implement code splitting
- Optimize images with next/image
- Use React.memo for expensive components
- Implement pagination for large datasets
- Cache API responses

---

## Common Patterns

### Form with Server Action

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createExample } from "@/app/actions/example-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function ExampleForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createExample,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success("Created successfully");
        form.reset();
      } else {
        toast.error(data.error);
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools

- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database
- [Vercel](https://vercel.com/) - Deployment platform
- [Railway](https://railway.app/) - Alternative deployment

---

## Conclusion

This template provides a complete foundation for building modern full-stack applications with Next.js. The structure is modular, scalable, and follows industry best practices. You can now focus on implementing business-specific features without worrying about the foundational setup.

**Remember to:**

- Customize configurations for your specific needs
- Add business logic in appropriate action files
- Create feature-specific Prisma models
- Build UI components based on your design system
- Implement proper error boundaries
- Add comprehensive testing
- Monitor performance in production

Happy coding! 🚀
