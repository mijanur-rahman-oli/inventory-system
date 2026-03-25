"use client";

import { useState } from "react";
import { Copy, RefreshCw, Trash2, Key, Check } from "lucide-react";
import { generateApiToken, revokeApiToken } from "@/lib/actions/apiToken";
import toast from "react-hot-toast";

interface Props {
  inventoryId: string;
  currentToken: string | null;
}

export function ApiTokenPanel({ inventoryId, currentToken }: Props) {
  const [token, setToken] = useState(currentToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateApiToken(inventoryId);
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error ?? "Error");
      return;
    }
    setToken(result.token ?? null);
    toast.success("API token generated");
  };

  const handleRevoke = async () => {
    if (!confirm("Revoke this token? All Odoo integrations using it will stop working.")) return;
    setLoading(true);
    await revokeApiToken(inventoryId);
    setLoading(false);
    setToken(null);
    toast.success("Token revoked");
  };

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exampleUrl = `${
    typeof window !== "undefined" ? window.location.origin : "https://yourapp.vercel.app"
  }/api/v1/odoo/inventory`;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Key className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="font-semibold text-[var(--text)]">Odoo API Token</h3>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Use this token to authenticate read-only Odoo API requests.
      </p>

      {token ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 font-mono text-[var(--accent)] truncate">
              {token}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            >
              {copied
                ? <Check className="w-4 h-4 text-emerald-500" />
                : <Copy className="w-4 h-4 text-[var(--text-muted)]" />
              }
            </button>
          </div>

          {/* Example curl */}
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3">
            <p className="text-[10px] text-[var(--text-muted)] mb-1.5 font-medium uppercase tracking-wide">
              Example Request
            </p>
            <code className="text-[10px] text-[var(--text-muted)] break-all">
              {`curl -H "Authorization: Bearer ${token}" ${exampleUrl}`}
            </code>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Revoke
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          <Key className="w-4 h-4" />
          {loading ? "Generating..." : "Generate Token"}
        </button>
      )}
    </div>
  );
}