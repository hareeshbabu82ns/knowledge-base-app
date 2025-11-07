"use server";

// import { revalidatePath } from "next/cache"
// import { redirect } from "next/navigation"
import { differenceInMinutes, format, subDays } from "date-fns";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";
import { UserSigninSchema, UserSignupSchema } from "@/lib/validations/user";
import { signIn as naSignIn, signOut as naSignOut } from ".";

export type SignInEmailResponse =
  | { status: "success"; message: string }
  | { status: "error"; error: string };

export const signIn = async (provider?: string) => {
  return naSignIn(provider);
};
export const signInCredentials = async (
  values: z.infer<typeof UserSigninSchema>,
) => {
  const validatedFields = UserSigninSchema.safeParse(values);
  if (!validatedFields.success) throw new Error("Invalid fields");

  return naSignIn("credentials", {
    ...validatedFields.data,
    callbackUrl: "/dashboard",
  });
};

export const signInEmail = async (
  email: string,
): Promise<SignInEmailResponse> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { status: "error", error: "Please enter a valid email address" };
    }

    // Check for recent token generation
    const dbToken = await db.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (dbToken) {
      const tokenGenDate = subDays(dbToken?.expires || new Date(), 1);
      const diffMins = differenceInMinutes(new Date(), tokenGenDate);
      if (diffMins < siteConfig.emailVerificationDuration) {
        const remainingMins = siteConfig.emailVerificationDuration - diffMins;
        return {
          status: "error",
          error: `Token already sent to ${email} at ${format(tokenGenDate, "p")}. Please wait ${remainingMins} more minute${remainingMins > 1 ? "s" : ""} before requesting a new one.`,
        };
      }
    }

    // Attempt to send sign-in email
    const result = await naSignIn("resend", { email, redirect: false });

    if (result?.error) {
      console.error("SignIn error:", result.error);
      return {
        status: "error",
        error:
          "Failed to send magic link. Please try again or contact support.",
      };
    }

    return {
      status: "success",
      message: `Magic link sent to ${email}! Check your inbox and spam folder.`,
    };
  } catch (error) {
    console.error("SignInEmail error:", error);
    return {
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
};

export const signOut = async () => {
  await naSignOut();
  // revalidatePath("/")
  // redirect("/")
};

export type SignUpResponse =
  | { status: "success"; message: string }
  | { status: "error"; error: string };

export const signUp = async (
  values: z.infer<typeof UserSignupSchema>,
): Promise<SignUpResponse> => {
  try {
    // Validate input fields
    const validatedFields = UserSignupSchema.safeParse(values);

    if (!validatedFields.success) {
      const errors = validatedFields.error.errors
        .map((err) => err.message)
        .join(", ");
      return { status: "error", error: errors };
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    let isUpdatingOAuthUser = false;

    if (existingUser) {
      // User exists - check if they have a password
      if (existingUser.password) {
        // User already has credentials set up
        return {
          status: "error",
          error:
            "An account with this email already exists. Please sign in instead.",
        };
      }

      // User exists but doesn't have a password (OAuth user)
      // Add password to their account to enable credentials login
      isUpdatingOAuthUser = true;
      user = await db.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: name || existingUser.name, // Update name if provided, otherwise keep existing
          emailVerified: existingUser.emailVerified || new Date(), // Keep existing verification or set new
        },
      });
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
          emailVerified: new Date(), // Auto-verify for credentials signup
        },
      });
    }

    // Automatically sign in the user
    const signInResult = await naSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      const message = isUpdatingOAuthUser
        ? "Password added successfully! Please sign in to continue."
        : "Account created successfully! Please sign in to continue.";
      return {
        status: "success",
        message,
      };
    }

    const successMessage = isUpdatingOAuthUser
      ? "Password added to your account! You can now sign in with email and password."
      : "Account created and signed in successfully!";

    return {
      status: "success",
      message: successMessage,
    };
  } catch (error) {
    console.error("SignUp error:", error);
    return {
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
};
