// components/auth/SignInWrapper.tsx
"use client";

import { SignIn } from "@stackframe/stack";
import { useRouter } from "next/navigation";

export function SignInWrapper() {
  const router = useRouter();

  return (
    <SignIn
      onSignIn={() => {
        router.push("/dashboard");
        router.refresh();
      }}
    />
  );
}