"use client"; // <--- Add this at the very top

import { GlobalSearch } from "./GlobalSearch";
import { useState } from "react";
import { SupportTicketModal } from "@/components/support/SupportTicketModal";

// Note: Ensure 'user' is passed as a prop or fetched via a hook like useUser()
export function Header({ title, user }: { title?: string; user?: any }) {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-card)]">
      {title && (
        <h1 className="text-lg font-semibold text-[var(--text)] hidden lg:block">
          {title}
        </h1>
      )}
      <div className="flex-1 lg:flex-none flex justify-end lg:justify-start lg:ml-auto gap-4">
        <GlobalSearch />
      </div>
    </header>
  );
}