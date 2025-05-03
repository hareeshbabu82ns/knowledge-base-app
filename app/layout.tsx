import type { Metadata } from "next";
import "react-datepicker/dist/react-datepicker.css";
import { fontSans, fontMono } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: "/manifest.webmanifest",
};

export default function RootLayout( {
  children,
}: Readonly<{
  children: React.ReactNode;
}> ) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn( fontSans.variable, fontMono.variable, "min-h-screen antialiased bg-background text-foreground" )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main id="skip">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
