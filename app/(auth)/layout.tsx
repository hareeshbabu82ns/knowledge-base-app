// import { redirect } from "next/navigation"
// import { auth } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await auth()
  // if (session?.session) redirect("/dashboard")

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      {children}
    </div>
  );
}
