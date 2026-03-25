"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

const SalesforceSchema = z.object({
  companyName: z.string().min(1).max(255),
  industry: z.string().min(1),
  jobTitle: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  userName: z.string(),
  userEmail: z.string().email(),
});

async function getSFToken(): Promise<{
  accessToken: string;
  instanceUrl: string;
}> {
  const instanceUrl =
    process.env.SF_INSTANCE_URL ?? "https://login.salesforce.com";

  const params = new URLSearchParams({
    grant_type: "password",
    client_id: process.env.SF_CLIENT_ID ?? "",
    client_secret: process.env.SF_CLIENT_SECRET ?? "",
    username: process.env.SF_USERNAME ?? "",
    password: `${process.env.SF_PASSWORD ?? ""}${
      process.env.SF_SECURITY_TOKEN ?? ""
    }`,
  });

  const res = await fetch(
    `${instanceUrl}/services/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SF auth failed: ${err}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    instanceUrl: data.instance_url ?? instanceUrl,
  };
}

export async function syncToSalesforce(input: unknown) {
  await getCurrentUser();

  const parsed = SalesforceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Validation: " + parsed.error.errors[0].message,
    };
  }

  const {
    companyName,
    industry,
    jobTitle,
    phone,
    userName,
    userEmail,
  } = parsed.data;

  let accessToken: string;
  let instanceUrl: string;

  try {
    const tokenData = await getSFToken();
    accessToken = tokenData.accessToken;
    instanceUrl = tokenData.instanceUrl;
  } catch (err) {
    console.error("Salesforce auth error:", err);
    return { error: "Salesforce authentication failed" };
  }

  const apiBase = `${instanceUrl}/services/data/v59.0/sobjects`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Step 1 — Create Account
  const accountRes = await fetch(`${apiBase}/Account`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      Name: companyName,
      Industry: industry,
    }),
  });

  if (!accountRes.ok) {
    const err = await accountRes.text();
    console.error("SF Account error:", err);
    return { error: "Failed to create Salesforce Account" };
  }

  const { id: accountId } = await accountRes.json();

  // Step 2 — Create Contact linked to Account
  const nameParts = userName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const contactRes = await fetch(`${apiBase}/Contact`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      AccountId: accountId,
      FirstName: firstName,
      LastName: lastName,
      Email: userEmail,
      Title: jobTitle,
      Phone: phone,
    }),
  });

  if (!contactRes.ok) {
    const err = await contactRes.text();
    console.error("SF Contact error:", err);
    return { error: "Failed to create Salesforce Contact" };
  }

  const { id: contactId } = await contactRes.json();

  return {
    success: true,
    accountId,
    contactId,
    instanceUrl,
  };
}