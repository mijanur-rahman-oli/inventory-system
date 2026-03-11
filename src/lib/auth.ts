import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  // 1. Always check if the SDK is initialized to prevent generic crashes
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  return user.id;
}

export async function isAdmin(): Promise<boolean> {
  const user = await stackServerApp.getUser();
  if (!user) return false;
  
  // Cast metadata safely
  const metadata = user.clientMetadata as { role?: string } | null;
  return metadata?.role === "admin";
}