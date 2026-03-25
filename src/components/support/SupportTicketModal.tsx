"use client";

import { useState } from "react";
import { X, AlertCircle, Send } from "lucide-react";
import { submitSupportTicket } from "@/lib/actions/support";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  userEmail: string;
  onClose: () => void;
}

type Priority = "High" | "Average" | "Low";

export function SupportTicketModal({ userEmail, onClose }: Props) {
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState<Priority>("Average");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setSubmitting(true);
    try {
      const result = await submitSupportTicket({
        summary,
        priority,
        pageUrl: window.location.href,
        userEmail,
      });

      if ("error" in result) {
        toast.error(result.error ?? "Failed to submit ticket");
        return;
      }

      setSubmitted(true);
      toast.success("Support ticket submitted successfully");
      setTimeout(onClose, 2000);
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
            <AlertCircle className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Support Ticket
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Send className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="font-medium text-[var(--text)]">
              Ticket submitted!
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Our team will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Summary *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                required
                placeholder="Describe your issue in detail..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {(["High", "Average", "Low"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium border transition-all",
                      priority === p
                        ? p === "High"
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : p === "Average"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] bg-[var(--bg)] rounded-lg px-3 py-2">
              <span className="font-medium">Page:</span>{" "}
              {typeof window !== "undefined"
                ? window.location.href
                : ""}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !summary.trim()}
                className="flex-1 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
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