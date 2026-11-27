"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowUpRight, Inbox, LogOut, MessageSquareQuote, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

type Brand = { id: string; name: string; websiteUrl: string | null; industry: string | null };

const modules = [
  { icon: Inbox, title: "Feedback inbox", description: "Collect and organize customer feedback.", status: "Coming next" },
  { icon: Sparkles, title: "AI intelligence", description: "Discover themes, sentiment and emerging issues.", status: "Coming next" },
  { icon: Activity, title: "Actions", description: "Turn customer insights into improvements.", status: "Coming next" },
  { icon: MessageSquareQuote, title: "Social proof studio", description: "Approve and publish customer stories.", status: "Coming next" },
];

export default function WorkspacePage() {
  const router = useRouter();
  const { status, user, organizations, logout } = useAuth();
  const organization = organizations[0];

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
    if (status === "authenticated" && organizations.length === 0) router.replace("/onboarding");
  }, [status, organizations.length, router]);

  const brandsQuery = useQuery({
    queryKey: organization ? queryKeys.brands.list(organization.id) : ["brands", "none"],
    queryFn: () => apiRequest<Brand[]>(`/brands?organizationId=${organization!.id}`),
    enabled: status === "authenticated" && Boolean(organization),
  });

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (status !== "authenticated" || !user || !organization) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Loading your workspace…</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#17231f]">
      <header className="border-b border-[#e5ebe6] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-[#1e5547] text-sm text-white">S</span>
            <span className="text-lg">signalnest</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-[#829087]">{organization.name}</p>
            </div>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-[#dce5df] px-3 py-2 text-sm text-[#52675c] transition hover:bg-[#f5f8f5]">
              <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#477766]">Workspace overview</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{organization.name}</h1>
            <p className="mt-2 text-sm text-[#718078]">Your customer voice workspace is ready.</p>
          </div>
          <div className="rounded-2xl border border-[#dce5df] bg-white px-4 py-3">
            <p className="text-xs text-[#829087]">Your role</p>
            <p className="mt-1 text-sm font-semibold">{organization.role.toLowerCase().replace(/^./, (letter) => letter.toUpperCase())}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-[#e0e8e2] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Your brands</h2>
              <p className="mt-1 text-sm text-[#829087]">Businesses you are collecting customer feedback for.</p>
            </div>
            <span className="rounded-xl bg-[#f0f5f1] px-3 py-2 text-xs font-semibold text-[#477766]">{brandsQuery.data?.length ?? "—"} brands</span>
          </div>
          {brandsQuery.isPending ? (
            <p className="mt-6 text-sm text-[#829087]">Loading brands…</p>
          ) : brandsQuery.isError ? (
            <p role="alert" className="mt-6 text-sm text-[#9b4338]">We couldn't load your brands. Refresh the page to try again.</p>
          ) : brandsQuery.data?.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {brandsQuery.data.map((brand) => (
                <div key={brand.id} className="rounded-2xl border border-[#edf1ed] bg-[#fbfcfa] p-4">
                  <p className="font-semibold">{brand.name}</p>
                  <p className="mt-1 text-xs text-[#829087]">{brand.websiteUrl || brand.industry || "Brand workspace"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#dce5df] p-6 text-center">
              <p className="text-sm font-medium">No brands yet</p>
              <p className="mt-1 text-xs text-[#829087]">Your workspace is created. Brand management is the next setup step.</p>
            </div>
          )}
        </div>

        <div className="mt-10">
          <div className="flex items-end justify-between">
            <div><h2 className="text-lg font-semibold">Product modules</h2><p className="mt-1 text-sm text-[#829087]">The four parts of the Signalnest workflow.</p></div>
            <span className="hidden text-xs text-[#829087] sm:block">Development in progress</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map(({ icon: Icon, title, description, status: moduleStatus }) => (
              <article key={title} className="rounded-2xl border border-[#e0e8e2] bg-white p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-[#f0f5f1] text-[#477766]"><Icon size={19} /></span>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 min-h-10 text-xs leading-5 text-[#829087]">{description}</p>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a8a62]">{moduleStatus}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
