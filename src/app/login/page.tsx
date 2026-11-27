"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/features/auth/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login, status, user, organizations } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user) router.replace(organizations.length ? "/workspace" : "/onboarding");
  }, [status, user, organizations.length, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
      router.replace("/workspace");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to sign in right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Your customers are talking."
      description="Pick up where your team left off. Your customer feedback, patterns and next actions are waiting in one place."
      footer={<>New to Signalnest? <Link href="/register" className="font-semibold text-[#1e5547] hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">Work email</label>
          <input id="email" type="email" autoComplete="email" required maxLength={254} value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#a0aaa4] focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10"
            placeholder="you@company.com" />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
          </div>
          <input id="password" type="password" autoComplete="current-password" required minLength={10} maxLength={128}
            value={password} onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#a0aaa4] focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10"
            placeholder="Enter your password" />
        </div>
        {error && <p role="alert" className="rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{error}</p>}
        <button type="submit" disabled={pending || status === "loading"}
          className="flex w-full items-center justify-center rounded-xl bg-[#1e5547] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#174638] disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-xs leading-5 text-[#8a968f]">By continuing, you agree to use Signalnest responsibly and keep customer information private.</p>
      </form>
    </AuthLayout>
  );
}
