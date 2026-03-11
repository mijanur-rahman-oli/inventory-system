import { SignIn } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SignInPage() {
  const user = await stackServerApp.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text)]">Sign In</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">to InventoryOS</p>
        </div>
        <div className="card p-6">
          <SignIn />
        </div>
        <p className="text-center text-sm text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}