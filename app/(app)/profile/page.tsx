"use client";

import { useSession } from "next-auth/react";
import ProfileForm from "./_components/profile-form";
import PasswordUpdateForm from "./_components/password-update-form";
import UserManagement from "./_components/user-management";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and account settings
        </p>
      </div>

      <ProfileForm />

      <Separator />

      <PasswordUpdateForm hasPassword={true} />

      {isAdmin && (
        <>
          <Separator />
          <UserManagement />
        </>
      )}
    </div>
  );
}
