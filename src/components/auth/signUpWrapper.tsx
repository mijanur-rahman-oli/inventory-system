// components/auth/SignUpWrapper.tsx
"use client";

import { SignUp } from "@stackframe/stack";
import { useRouter } from "next/navigation";

export function SignUpWrapper() {
  const router = useRouter();

  return (
    <SignUp
      onSignUp={() => {
        router.push("/dashboard");
        router.refresh();
      }}
    />
  );
}