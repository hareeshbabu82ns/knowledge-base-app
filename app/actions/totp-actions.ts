"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
  encrypt,
  decrypt,
} from "@/lib/auth/totp";

export type TotpActionResponse<T = unknown> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

/**
 * Setup TOTP for a user - generates secret and QR code
 */
export async function setupTOTP(userId?: string): Promise<
  TotpActionResponse<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }>
> {
  try {
    const session = await auth();
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
      return { status: "error", error: "Unauthorized" };
    }

    // Check if admin is managing another user OR if this is a new signup (no session yet)
    if (userId && session && userId !== session?.user?.id) {
      // Only check admin authorization if there's a session
      if (session?.user?.role !== "ADMIN") {
        return { status: "error", error: "Unauthorized" };
      }
    }

    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: { email: true, totpEnabled: true },
    });

    if (!user || !user.email) {
      return { status: "error", error: "User not found" };
    }

    // Generate new TOTP secret
    const secret = generateTOTPSecret();
    const qrCode = await generateQRCode({
      email: user.email,
      secret,
    });

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    return {
      status: "success",
      data: {
        secret,
        qrCode,
        backupCodes,
      },
    };
  } catch (error) {
    console.error("Setup TOTP error:", error);
    return { status: "error", error: "Failed to setup TOTP" };
  }
}

/**
 * Enable TOTP for a user after verifying the token
 */
const EnableTOTPSchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z.string().length(6, "Token must be 6 digits"),
  backupCodes: z.array(z.string()),
  userId: z.string().optional(),
});

export async function enableTOTP(
  data: z.infer<typeof EnableTOTPSchema>,
): Promise<TotpActionResponse<{ backupCodes: string[] }>> {
  try {
    const validated = EnableTOTPSchema.parse(data);
    const session = await auth();
    const targetUserId = validated.userId || session?.user?.id;

    if (!targetUserId) {
      return { status: "error", error: "Unauthorized" };
    }

    // Check if admin is managing another user OR if this is a new signup (no session yet)
    if (validated.userId && session && validated.userId !== session?.user?.id) {
      // Only check admin authorization if there's a session
      if (session?.user?.role !== "ADMIN") {
        return { status: "error", error: "Unauthorized" };
      }
    }

    // Verify the token
    const isValid = verifyTOTP({
      token: validated.token,
      secret: validated.secret,
    });

    if (!isValid) {
      return { status: "error", error: "Invalid verification code" };
    }

    // Hash backup codes
    const hashedBackupCodes = await hashBackupCodes(validated.backupCodes);

    // Encrypt and save the secret
    const encryptedSecret = encrypt(validated.secret);

    await db.user.update({
      where: { id: targetUserId },
      data: {
        totpSecret: encryptedSecret,
        totpEnabled: true,
        totpBackupCodes: hashedBackupCodes,
      },
    });

    return {
      status: "success",
      data: {
        backupCodes: validated.backupCodes,
      },
    };
  } catch (error) {
    console.error("Enable TOTP error:", error);
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
      };
    }
    return { status: "error", error: "Failed to enable TOTP" };
  }
}

/**
 * Verify TOTP token for a user
 */
const VerifyTOTPSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  token: z
    .string()
    .min(6, "Token must be at least 6 characters")
    .max(8, "Token must be at most 8 characters"),
});

export async function verifyUserTOTP(
  data: z.infer<typeof VerifyTOTPSchema>,
): Promise<TotpActionResponse<{ verified: true }>> {
  try {
    const validated = VerifyTOTPSchema.parse(data);

    const user = await db.user.findUnique({
      where: { id: validated.userId },
      select: { totpSecret: true, totpEnabled: true, totpBackupCodes: true },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return { status: "error", error: "TOTP not enabled for this user" };
    }

    // Decrypt the secret
    const secret = decrypt(user.totpSecret);

    // First, try to verify as TOTP token
    const isValidTOTP = verifyTOTP({
      token: validated.token,
      secret,
    });

    if (isValidTOTP) {
      return { status: "success", data: { verified: true } };
    }

    // If TOTP fails, try backup code
    const backupCodeResult = await verifyBackupCode(
      validated.token,
      user.totpBackupCodes,
    );

    if (backupCodeResult.isValid) {
      // Remove used backup code
      const updatedBackupCodes = user.totpBackupCodes.filter(
        (_, index) => index !== backupCodeResult.usedIndex,
      );

      await db.user.update({
        where: { id: validated.userId },
        data: { totpBackupCodes: updatedBackupCodes },
      });

      return { status: "success", data: { verified: true } };
    }

    return { status: "error", error: "Invalid verification code" };
  } catch (error) {
    console.error("Verify TOTP error:", error);
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
      };
    }
    return { status: "error", error: "Failed to verify TOTP" };
  }
}

/**
 * Disable TOTP for a user
 */
const DisableTOTPSchema = z.object({
  userId: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
});

export async function disableTOTP(
  data: z.infer<typeof DisableTOTPSchema>,
): Promise<TotpActionResponse<{ disabled: true }>> {
  try {
    const validated = DisableTOTPSchema.parse(data);
    const session = await auth();
    const targetUserId = validated.userId || session?.user?.id;

    if (!targetUserId) {
      return { status: "error", error: "Unauthorized" };
    }

    const isAdmin = session?.user?.role === "ADMIN";
    const isSelf = targetUserId === session?.user?.id;

    // Check authorization
    if (!isSelf && !isAdmin) {
      return { status: "error", error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: { totpSecret: true, totpEnabled: true, password: true },
    });

    if (!user) {
      return { status: "error", error: "User not found" };
    }

    // If user is disabling their own TOTP, require verification
    if (isSelf && !isAdmin) {
      if (validated.token && user.totpSecret) {
        const secret = decrypt(user.totpSecret);
        const isValid = verifyTOTP({
          token: validated.token,
          secret,
        });

        if (!isValid) {
          return { status: "error", error: "Invalid verification code" };
        }
      } else if (validated.password && user.password) {
        const bcrypt = await import("bcryptjs");
        const isValid = await bcrypt.compare(validated.password, user.password);

        if (!isValid) {
          return { status: "error", error: "Invalid password" };
        }
      } else {
        return {
          status: "error",
          error: "Verification required to disable TOTP",
        };
      }
    }

    // Admin can disable without verification
    await db.user.update({
      where: { id: targetUserId },
      data: {
        totpSecret: null,
        totpEnabled: false,
        totpBackupCodes: [],
      },
    });

    return { status: "success", data: { disabled: true } };
  } catch (error) {
    console.error("Disable TOTP error:", error);
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
      };
    }
    return { status: "error", error: "Failed to disable TOTP" };
  }
}

/**
 * Regenerate backup codes
 */
const RegenerateBackupCodesSchema = z.object({
  userId: z.string().optional(),
  token: z.string().length(6, "Token must be 6 digits"),
});

export async function regenerateBackupCodes(
  data: z.infer<typeof RegenerateBackupCodesSchema>,
): Promise<TotpActionResponse<{ backupCodes: string[] }>> {
  try {
    const validated = RegenerateBackupCodesSchema.parse(data);
    const session = await auth();
    const targetUserId = validated.userId || session?.user?.id;

    if (!targetUserId) {
      return { status: "error", error: "Unauthorized" };
    }

    // Check if admin is managing another user
    if (validated.userId && validated.userId !== session?.user?.id) {
      if (session?.user?.role !== "ADMIN") {
        return { status: "error", error: "Unauthorized" };
      }
    }

    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: { totpSecret: true, totpEnabled: true },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return { status: "error", error: "TOTP not enabled" };
    }

    // Verify the token
    const secret = decrypt(user.totpSecret);
    const isValid = verifyTOTP({
      token: validated.token,
      secret,
    });

    if (!isValid) {
      return { status: "error", error: "Invalid verification code" };
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    await db.user.update({
      where: { id: targetUserId },
      data: { totpBackupCodes: hashedBackupCodes },
    });

    return {
      status: "success",
      data: { backupCodes },
    };
  } catch (error) {
    console.error("Regenerate backup codes error:", error);
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
      };
    }
    return { status: "error", error: "Failed to regenerate backup codes" };
  }
}

/**
 * Get TOTP status for a user
 */
export async function getTOTPStatus(userId?: string): Promise<
  TotpActionResponse<{
    enabled: boolean;
    backupCodesCount: number;
  }>
> {
  try {
    const session = await auth();
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
      return { status: "error", error: "Unauthorized" };
    }

    // Check if admin is viewing another user
    if (userId && userId !== session?.user?.id) {
      if (session?.user?.role !== "ADMIN") {
        return { status: "error", error: "Unauthorized" };
      }
    }

    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: { totpEnabled: true, totpBackupCodes: true },
    });

    if (!user) {
      return { status: "error", error: "User not found" };
    }

    return {
      status: "success",
      data: {
        enabled: user.totpEnabled,
        backupCodesCount: user.totpBackupCodes.length,
      },
    };
  } catch (error) {
    console.error("Get TOTP status error:", error);
    return { status: "error", error: "Failed to get TOTP status" };
  }
}

/**
 * Check if TOTP is enabled for a user by email (public - no auth required)
 */
export async function checkTOTPByEmail(
  email: string,
): Promise<TotpActionResponse<{ totpEnabled: boolean }>> {
  try {
    if (!email) {
      return { status: "error", error: "Email is required" };
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { totpEnabled: true },
    });

    // Return false if user not found (don't reveal user existence)
    return {
      status: "success",
      data: {
        totpEnabled: user?.totpEnabled || false,
      },
    };
  } catch (error) {
    console.error("Check TOTP by email error:", error);
    return { status: "error", error: "Failed to check TOTP status" };
  }
}
