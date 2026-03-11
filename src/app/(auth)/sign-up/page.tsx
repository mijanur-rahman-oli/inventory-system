import { SignUp } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SignUpPage() {
  const user = await stackServerApp.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text)]">Create Account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Join InventoryOS</p>
        </div>
        <div className="card p-6">
          <SignUp />
        </div>
        <p className="text-center text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}