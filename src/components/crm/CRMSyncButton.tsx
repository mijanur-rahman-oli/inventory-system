"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";

export function CRMSyncButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    // This is where you will call your Salesforce Server Action later
    console.log("Syncing to Salesforce...");
    setTimeout(() => setLoading(false), 2000); 
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
    >
      <UserCheck className="w-4 h-4" />
      {loading ? "Syncing..." : "Sync to Salesforce"}
    </button>
  );
}