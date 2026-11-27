"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/features/auth/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { register, status, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (status === "authenticated" && user) {
    router.replace("/onboarding");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await register(name, email, password);
      router.replace("/onboarding");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to create your account right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Make every customer signal count."
      description="Create your workspace to collect feedback, understand what customers need and turn great experiences into social proof."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-[#1e5547] hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">Your name</label>
          <input id="name" type="text" autoComplete="name" required minLength={2} maxLength={80} value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#a0aaa4] focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10"
            placeholder="Alex Morgan" />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">Work email</label>
          <input id="email" type="email" autoComplete="email" required maxLength={254} value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#a0aaa4] focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10"
            placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
          <input id="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128}
            value={password} onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#a0aaa4] focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10"
            placeholder="At least 10 characters" />
          <p className="mt-2 text-xs text-[#8a968f]">Use at least 10 characters. A unique passphrase is recommended.</p>
        </div>
        {error && <p role="alert" className="rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{error}</p>}
        <button type="submit" disabled={pending || status === "loading"}
          className="flex w-full items-center justify-center rounded-xl bg-[#1e5547] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#174638] disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Creating account…" : "Create account"}
        </button>
        <p className="text-center text-xs leading-5 text-[#8a968f]">Your refresh session is stored in a secure HttpOnly cookie. Signalnest does not store your password in the browser.</p>
      </form>
    </AuthLayout>
  );
}
