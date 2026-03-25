"use client";

import { AccountSettings } from "@stackframe/stack";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">
          Account Settings
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your profile, password, and connected accounts.
        </p>
      </div>
      <div className="card p-6">
        <AccountSettings />
      </div>
    </div>
  );
}