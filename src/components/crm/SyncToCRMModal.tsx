"use client";

import { useState } from "react";
import { X, Building2, Briefcase, Phone, Layers } from "lucide-react";
import { syncToSalesforce } from "@/lib/actions/salesforce";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Media",
  "Transportation",
  "Other",
];

interface Props {
  userName: string;
  userEmail: string;
  onClose: () => void;
}

export function SyncToCRMModal({ userName, userEmail, onClose }: Props) {
  const [form, setForm] = useState({
    companyName: "",
    industry: "Technology",
    jobTitle: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    accountId: string;
    contactId: string;
  } | null>(null);

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await syncToSalesforce({
        ...form,
        userName,
        userEmail,
      });

      if ("error" in res) {
        toast.error(res.error ?? "Salesforce sync failed");
        return;
      }

      setResult(res as { accountId: string; contactId: string });
      toast.success("Synced to Salesforce CRM");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Sync to Salesforce CRM
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5 text-sky-400" />
            </div>
            <p className="text-center font-medium text-[var(--text)]">
              Successfully synced!
            </p>
            <div className="bg-[var(--bg)] rounded-xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Account ID</span>
                <span className="text-[var(--text)]">{result.accountId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Contact ID</span>
                <span className="text-[var(--text)]">{result.contactId}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-xs text-[var(--text-muted)] bg-[var(--bg)] rounded-lg px-3 py-2">
              Syncing as:{" "}
              <span className="font-medium text-[var(--text)]">
                {userName} ({userEmail})
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                <Building2 className="w-3.5 h-3.5 inline mr-1" />
                Company Name *
              </label>
              <input
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                required
                placeholder="Acme Corporation"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                Industry *
              </label>
              <select
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                <Briefcase className="w-3.5 h-3.5 inline mr-1" />
                Job Title
              </label>
              <input
                value={form.jobTitle}
                onChange={(e) => set("jobTitle", e.target.value)}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1" />
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 555 000 0000"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !form.companyName}
                className="flex-1 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {submitting ? "Syncing..." : "Sync to CRM"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-[var(--border)] text-[var(--text)] rounded-lg text-sm font-medium hover:opacity-80"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}