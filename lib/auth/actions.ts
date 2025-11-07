"use server";

// import { revalidatePath } from "next/cache"
// import { redirect } from "next/navigation"
import { differenceInMinutes, format, subDays } from "date-fns";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";
import { UserSigninSchema } from "@/lib/validations/user";
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
