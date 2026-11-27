"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Building2, Globe2 } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { apiRequest, ApiError } from "@/lib/api/client";

export default function OnboardingPage() {
  const router = useRouter();
  const { status, user, organizations, refreshProfile } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && organizations.length > 0) router.replace("/workspace");
    if (status === "anonymous") router.replace("/login");
  }, [status, organizations.length, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const organization = await apiRequest<{ id: string }>("/organizations", {
        method: "POST",
        body: { name: organizationName, defaultCurrency: "USD", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" },
      });
      await apiRequest("/brands", {
        method: "POST",
        body: { organizationId: organization.id, name: brandName, websiteUrl: websiteUrl || undefined, industry: industry || undefined },
      });
      await refreshProfile();
      router.replace("/workspace");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "We couldn't create your workspace. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (status !== "authenticated" || !user || organizations.length > 0) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Preparing your workspace…</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-6 py-10 text-[#17231f]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#1e5547] text-sm text-white">S</span>
          <span className="text-lg">signalnest</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#477766]">Step 1 of 1 · Workspace setup</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Give your customer voice a home.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#718078]">
          Create an organization and add the first brand you want to listen to. You can add more brands and teammates later.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-6 rounded-3xl border border-[#e0e8e2] bg-white p-7 shadow-[0_24px_80px_-48px_rgba(31,69,54,.35)] sm:p-9">
          <div className="flex items-center gap-3 border-b border-[#edf1ed] pb-5">
            <span className="grid size-10 place-items-center rounded-xl bg-[#f0f5f1] text-[#477766]"><Building2 size={19} /></span>
            <div><h2 className="font-semibold">Organization</h2><p className="text-xs text-[#829087]">Your team’s shared workspace</p></div>
          </div>
          <div>
            <label htmlFor="organizationName" className="mb-2 block text-sm font-medium">Organization name</label>
            <input id="organizationName" required minLength={2} maxLength={100} value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)} placeholder="Acme Studio"
              className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none transition focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10" />
          </div>

          <div className="flex items-center gap-3 border-b border-[#edf1ed] pb-5 pt-2">
            <span className="grid size-10 place-items-center rounded-xl bg-[#f0f5f1] text-[#477766]"><Globe2 size={19} /></span>
            <div><h2 className="font-semibold">First brand</h2><p className="text-xs text-[#829087]">The business customers give feedback about</p></div>
          </div>
          <div>
            <label htmlFor="brandName" className="mb-2 block text-sm font-medium">Brand name</label>
            <input id="brandName" required minLength={2} maxLength={100} value={brandName}
              onChange={(event) => setBrandName(event.target.value)} placeholder="Acme"
              className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none transition focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10" />
          </div>
          <div>
            <label htmlFor="websiteUrl" className="mb-2 block text-sm font-medium">Website <span className="font-normal text-[#8a968f]">· optional</span></label>
            <input id="websiteUrl" type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none transition focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10" />
          </div>
          <div>
            <label htmlFor="industry" className="mb-2 block text-sm font-medium">Industry <span className="font-normal text-[#8a968f]">· optional</span></label>
            <select id="industry" value={industry} onChange={(event) => setIndustry(event.target.value)}
              className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none focus:border-[#477766]">
              <option value="">Choose an industry</option>
              <option value="SaaS">SaaS</option>
              <option value="D2C">D2C</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Digital agency">Digital agency</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {error && <p role="alert" className="rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{error}</p>}
          <button type="submit" disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e5547] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#174638] disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "Creating workspace…" : "Create workspace"} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </main>
  );
}
