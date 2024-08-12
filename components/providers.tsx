"use client";

import * as React from "react";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/sonner";

// import { TooltipProvider } from "@/components/ui/tooltip";

export const queryClient = new QueryClient();

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider {...props}>
          {/* <TooltipProvider delayDuration={0}>{children}</TooltipProvider> */}
          <Toaster position="bottom-center" />
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
