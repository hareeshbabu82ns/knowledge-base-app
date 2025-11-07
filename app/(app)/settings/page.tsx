"use client";

import { useSession } from "next-auth/react";
import AppearanceSettings from "./_components/appearance";
import AdminSettings from "./_components/admin-settings";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <AppearanceSettings />

      {isAdmin && (
        <>
          <Separator />
          <AdminSettings />
        </>
      )}
    </div>
  );
}
