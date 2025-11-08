"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export type ActionResponse<T = unknown> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// Profile update schema
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  image: z.string().url("Invalid image URL").optional().nullable(),
});

/**
 * Update user profile
 */
export async function updateProfile(
  data: z.infer<typeof updateProfileSchema>,
): Promise<
  ActionResponse<{
    name: string | null;
    email: string | null;
    image?: string | null;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    // Validate input
    const validated = updateProfileSchema.parse(data);

    // Check if email is already taken by another user
    if (validated.email !== session.user.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: validated.email,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return { status: "error", error: "Email is already in use" };
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        email: validated.email,
        image: validated.image,
      },
      select: {
        name: true,
        email: true,
        image: true,
      },
    });

    revalidatePath("/profile");
    return { status: "success", data: updatedUser };
  } catch (error) {
    console.error("Profile update failed:", error);

    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.issues.map((e) => e.message).join(", ")}`,
      };
    }

    return { status: "error", error: "Failed to update profile" };
  }
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(): Promise<
  ActionResponse<
    Array<{
      id: string;
      name: string | null;
      email: string | null;
      role: string;
      createdAt: Date;
      image: string | null;
    }>
  >
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    if (session.user.role !== "ADMIN") {
      return { status: "error", error: "Admin access required" };
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { status: "success", data: users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { status: "error", error: "Failed to fetch users" };
  }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(
  userId: string,
  role: "USER" | "ADMIN",
): Promise<ActionResponse<{ id: string; role: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    if (session.user.role !== "ADMIN") {
      return { status: "error", error: "Admin access required" };
    }

    // Prevent admin from demoting themselves
    if (userId === session.user.id && role !== "ADMIN") {
      return {
        status: "error",
        error: "You cannot change your own admin role",
      };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true },
    });

    revalidatePath("/profile");
    return { status: "success", data: updatedUser };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { status: "error", error: "Failed to update user role" };
  }
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(
  userId: string,
): Promise<ActionResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    if (session.user.role !== "ADMIN") {
      return { status: "error", error: "Admin access required" };
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return { status: "error", error: "You cannot delete your own account" };
    }

    await db.user.delete({
      where: { id: userId },
    });

    revalidatePath("/profile");
    return { status: "success", data: null };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { status: "error", error: "Failed to delete user" };
  }
}

// Password update schema
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Update user password (for users with existing password)
 */
export async function updatePassword(
  data: z.infer<typeof updatePasswordSchema>,
): Promise<ActionResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    // Validate input
    const validated = updatePasswordSchema.parse(data);

    // Get user with password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return { status: "error", error: "User not found" };
    }

    // If user has a password, verify current password
    if (user.password) {
      if (!validated.currentPassword) {
        return {
          status: "error",
          error: "Current password is required",
        };
      }

      const isPasswordValid = await bcrypt.compare(
        validated.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        return {
          status: "error",
          error: "Current password is incorrect",
        };
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10);

    // Update password
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    revalidatePath("/profile");
    return { status: "success", data: null };
  } catch (error) {
    console.error("Password update failed:", error);

    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.issues.map((e) => e.message).join(", ")}`,
      };
    }

    return { status: "error", error: "Failed to update password" };
  }
}

// Admin set user password schema
const setUserPasswordSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Set user password (Admin only)
 */
export async function setUserPassword(
  data: z.infer<typeof setUserPasswordSchema>,
): Promise<ActionResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    if (session.user.role !== "ADMIN") {
      return { status: "error", error: "Admin access required" };
    }

    // Validate input
    const validated = setUserPasswordSchema.parse(data);

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10);

    // Update password
    await db.user.update({
      where: { id: validated.userId },
      data: { password: hashedPassword },
    });

    revalidatePath("/profile");
    return { status: "success", data: null };
  } catch (error) {
    console.error("Set user password failed:", error);

    if (error instanceof z.ZodError) {
      return {
        status: "error",
        error: `Validation error: ${error.issues.map((e) => e.message).join(", ")}`,
      };
    }

    return { status: "error", error: "Failed to set user password" };
  }
}
