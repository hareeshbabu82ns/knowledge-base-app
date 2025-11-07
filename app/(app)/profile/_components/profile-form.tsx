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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/app/actions/profile-actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  image: z.string().url("Invalid image URL").optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(
    session?.user?.image || null,
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      image: session?.user?.image || "",
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      if (data.status === "success") {
        // Update session
        await update({
          name: data.data.name,
          email: data.data.email,
          image: data.data.image,
        });
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      console.error("Profile update error:", error);
      toast.error("An unexpected error occurred");
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    mutation.mutate(values);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("image", value);
    setImagePreview(value);
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile information and manage your account settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-6">
            <Avatar className="size-24">
              <AvatarImage src={imagePreview || undefined} />
              <AvatarFallback className="text-2xl font-bold">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="image">Profile Image URL</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="image"
                  placeholder="https://example.com/avatar.jpg"
                  {...form.register("image")}
                  onChange={handleImageChange}
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="size-4" />
                </Button>
              </div>
              {form.formState.errors.image && (
                <p className="text-destructive mt-1 text-sm">
                  {form.formState.errors.image.message}
                </p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Note: Changing your email may require re-verification.
            </p>
          </div>

          {/* Role Display */}
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="bg-muted flex items-center gap-2 rounded-md border px-3 py-2">
              <span className="text-sm font-medium">{session.user.role}</span>
              {session.user.role === "ADMIN" && (
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
