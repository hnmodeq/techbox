"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      storageKey="takbox-theme"
      defaultTheme="system"
      enableSystem
      // Disable every CSS transition for the single class-swap frame so all
      // surfaces/text/buttons change together instead of finishing in waves.
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
