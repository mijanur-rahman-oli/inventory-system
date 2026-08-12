"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
      storageKey="theme"
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "dark:bg-zinc-800 dark:text-white",
          duration: 3000,
        }}
      />
    </NextThemesProvider>
  );
}