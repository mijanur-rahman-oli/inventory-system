"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "dark:bg-zinc-800 dark:text-white",
          duration: 3000,
        }}
      />
    </ThemeProvider>
  );
}