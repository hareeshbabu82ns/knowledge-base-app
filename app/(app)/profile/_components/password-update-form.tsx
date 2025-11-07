"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { updatePassword } from "@/app/actions/profile-actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";

const passwordSchema = z
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

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordUpdateFormProps {
  hasPassword?: boolean;
}

export default function PasswordUpdateForm({
  hasPassword = false,
}: PasswordUpdateFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(
          hasPassword
            ? "Password updated successfully"
            : "Password set successfully",
        );
        form.reset();
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      console.error("Password update error:", error);
      toast.error("An unexpected error occurred");
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="size-5" />
          <CardTitle>
            {hasPassword ? "Change Password" : "Set Password"}
          </CardTitle>
        </div>
        <CardDescription>
          {hasPassword
            ? "Update your password to keep your account secure"
            : "Set a password to enable email/password login"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password - only show if user already has a password */}
          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  {...form.register("currentPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
          )}

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                {...form.register("newPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.newPassword && (
              <p className="text-destructive text-sm">
                {form.formState.errors.newPassword.message}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Must be at least 8 characters with uppercase, lowercase, and
              numbers
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                {...form.register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-destructive text-sm">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {hasPassword ? "Update Password" : "Set Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
