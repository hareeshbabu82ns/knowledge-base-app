import NextAuthProvider from "@/components/auth/Provider";
import WithDefaultLayout from "@/components/layout/default-layout";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextAuthProvider>
      <WithDefaultLayout>{children}</WithDefaultLayout>
    </NextAuthProvider>
  );
}
