import NextAuthProvider from "@/components/auth/Provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
