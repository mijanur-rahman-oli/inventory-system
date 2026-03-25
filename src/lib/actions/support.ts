"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { stackServerApp } from "@/stack/server";

const TicketSchema = z.object({
  summary: z.string().min(1).max(2000),
  priority: z.enum(["High", "Average", "Low"]),
  pageUrl: z.string().url(),
  userEmail: z.string().email(),
});

async function uploadToOneDrive(
  fileName: string,
  content: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  const token = process.env.MS_GRAPH_TOKEN;

  if (!token) {
    console.warn("MS_GRAPH_TOKEN not set — logging ticket to console");
    console.log("TICKET:", content);
    return { success: true, fileUrl: "console_only" };
  }

  // Create /SupportTickets folder if not exists and upload file
  const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/SupportTickets/${fileName}:/content`;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: content,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OneDrive upload error:", err);
    return { success: false, error: "OneDrive upload failed" };
  }

  const data = await res.json();
  return {
    success: true,
    fileUrl: data.webUrl ?? null,
  };
}

export async function submitSupportTicket(input: unknown) {
  const user = await getCurrentUser();

  const parsed = TicketSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Validation: " + parsed.error.errors[0].message,
    };
  }

  const { summary, priority, pageUrl, userEmail } = parsed.data;

  // Collect admin emails
  let adminEmails: string[] = [];
  try {
    const result = await stackServerApp.listUsers();
    const allUsers = Array.isArray(result)
      ? result
      : (result as { items?: unknown[] })?.items ?? [];
    adminEmails = (allUsers as { clientMetadata?: unknown; primaryEmail?: string | null }[])
      .filter(
        (u) =>
          (u.clientMetadata as { role?: string })?.role === "admin"
      )
      .map((u) => u.primaryEmail ?? "")
      .filter(Boolean);
  } catch {
    adminEmails = [];
  }

  const ticketId = `TKT-${Date.now()}`;

  const payload = {
    ticketId,
    submittedAt: new Date().toISOString(),
    submittedBy: {
      userId: user.id,
      email: userEmail,
    },
    ticket: {
      summary,
      priority,
      pageUrl,
    },
    adminEmails,
    metadata: {
      appName: "InventoryOS",
      environment: process.env.NODE_ENV ?? "production",
    },
  };

  const fileName = `${ticketId}_${Date.now()}.json`;
  const result = await uploadToOneDrive(
    fileName,
    JSON.stringify(payload, null, 2)
  );

  if (!result.success) {
    return { error: result.error ?? "Upload failed" };
  }

  return {
    success: true,
    ticketId,
    fileUrl: result.fileUrl,
  };
}