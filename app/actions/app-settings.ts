"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export type ActionResponse<T = unknown> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// Schema for app settings
const appSettingsSchema = z.object({
  allowedSignupEmails: z.array(z.string().email()).default([]),
  allowedSignupDomains: z.array(z.string().min(1)).default([]),
  restrictSignup: z.boolean().default(false),
});

export type AppSettingsFormValues = z.infer<typeof appSettingsSchema>;

/**
 * Get current app settings
 */
export async function getAppSettings(): Promise<
  ActionResponse<AppSettingsFormValues>
> {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return { status: "error", error: "Unauthorized access" };
    }

    const settings = await db.appSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!settings) {
      // Return default settings if none exist
      return {
        status: "success",
        data: {
          allowedSignupEmails: [],
          allowedSignupDomains: [],
          restrictSignup: false,
        },
      };
    }

    return {
      status: "success",
      data: {
        allowedSignupEmails: settings.allowedSignupEmails,
        allowedSignupDomains: settings.allowedSignupDomains,
        restrictSignup: settings.restrictSignup,
      },
    };
  } catch (error) {
    console.error("Error fetching app settings:", error);
    return { status: "error", error: "Failed to fetch app settings" };
  }
}

/**
 * Update app settings (creates new if doesn't exist)
 */
export async function updateAppSettings(
  data: AppSettingsFormValues,
): Promise<ActionResponse<AppSettingsFormValues>> {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return { status: "error", error: "Unauthorized access" };
    }

    // Validate input
    const validated = appSettingsSchema.parse(data);

    // Check if settings exist
    const existingSettings = await db.appSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await db.appSettings.update({
        where: { id: existingSettings.id },
        data: {
          allowedSignupEmails: validated.allowedSignupEmails,
          allowedSignupDomains: validated.allowedSignupDomains,
          restrictSignup: validated.restrictSignup,
        },
      });
    } else {
      // Create new settings
      settings = await db.appSettings.create({
        data: {
          allowedSignupEmails: validated.allowedSignupEmails,
          allowedSignupDomains: validated.allowedSignupDomains,
          restrictSignup: validated.restrictSignup,
        },
      });
    }

    return {
      status: "success",
      data: {
        allowedSignupEmails: settings.allowedSignupEmails,
        allowedSignupDomains: settings.allowedSignupDomains,
        restrictSignup: settings.restrictSignup,
      },
    };
  } catch (error) {
    console.error("Error updating app settings:", error);

    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.issues.map((e) => e.message).join(", ")}`,
      };
    }

    return { status: "error", error: "Failed to update app settings" };
  }
}
