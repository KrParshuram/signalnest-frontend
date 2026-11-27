"use client";

import Link from "next/link";
import { useMemo, useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Inbox, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

type Brand = { id: string; name: string };
type Topic = { id: string; name: string };
type FeedbackItem = {
  id: string;
  originalContent: string;
  authorDisplayName: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNKNOWN";
  summary: string | null;
  brand: { id: string; name: string };
  source: { id: string; name: string; type: string };
  assignedTo: { id: string; name: string } | null;
  topicAssignments: { topic: { id: string; name: string; slug: string } }[];
};
type FeedbackResponse = {
  data: FeedbackItem[];
  page: { nextCursor: string | null; hasMore: boolean };
};

const sentimentStyles: Record<FeedbackItem["sentiment"], string> = {
  POSITIVE: "bg-[#edf6ef] text-[#3d7955]",
  NEGATIVE: "bg-[#fff0ed] text-[#a44d42]",
  NEUTRAL: "bg-[#f1f3f2] text-[#64716a]",
  UNKNOWN: "bg-[#f6f3e9] text-[#8a7746]",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function FeedbackInboxPage() {
  const { status, user, organizations } = useAuth();
  const organization = organizations[0];
  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [topicId, setTopicId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [cursors, setCursors] = useState<string[]>([]);
  const deferredSearch = useDeferredValue(search);

  const brandsQuery = useQuery({
    queryKey: organization ? queryKeys.brands.list(organization.id) : ["brands", "none"],
    queryFn: () => apiRequest<Brand[]>(`/brands?organizationId=${organization!.id}`),
    enabled: status === "authenticated" && Boolean(organization),
  });

  const topicsQuery = useQuery({
    queryKey: organization ? queryKeys.topics.list(organization.id) : ["topics", "none"],
    queryFn: () => apiRequest<Topic[]>(`/topics?organizationId=${organization!.id}`),
    enabled: status === "authenticated" && Boolean(organization),
  });
  const filters = useMemo(() => ({
    search: deferredSearch.trim(),
    brandId,
    sentiment,
    topicId,
    status: statusFilter,
    cursor: cursors.at(-1) ?? null,
  }), [deferredSearch, brandId, sentiment, topicId, statusFilter, cursors]);

  const feedbackQuery = useQuery({
    queryKey: organization ? queryKeys.feedback.list(organization.id, brandId || null, filters) : ["feedback", "none"],
    queryFn: () => {
      const params = new URLSearchParams({ organizationId: organization!.id, status: statusFilter, limit: "25" });
      if (deferredSearch.trim()) params.set("search", deferredSearch.trim());
      if (brandId) params.set("brandId", brandId);
      if (sentiment) params.set("sentiment", sentiment);
      if (topicId) params.set("topicId", topicId);
      if (filters.cursor) params.set("cursor", filters.cursor);
      return apiRequest<FeedbackResponse>(`/feedback?${params.toString()}`);
    },
    enabled: status === "authenticated" && Boolean(organization),
  });

  function resetPagination() {
    setCursors([]);
  }

  if (status !== "authenticated" || !user || !organization) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Loading feedback…</main>;
  }

  const items = feedbackQuery.data?.data ?? [];
  const canManage = organization.role !== "VIEWER";

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#17231f]">
      <header className="border-b border-[#e5ebe6] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/workspace" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-[#1e5547] text-sm text-white">S</span>
            <span className="text-lg">signalnest</span>
          </Link>
          <Link href="/workspace" className="text-sm text-[#718078] hover:text-[#1e5547]">Workspace</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-9 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#477766]">{organization.name}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Feedback inbox</h1>
            <p className="mt-2 text-sm text-[#718078]">Every customer signal, in one searchable place.</p>
          </div>
          {canManage && <div className="flex flex-wrap gap-2">
            {["OWNER", "ADMIN", "MANAGER"].includes(organization.role) && <Link href="/feedback/import/csv" className="inline-flex items-center gap-2 rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm font-semibold text-[#52675c] transition hover:bg-[#f5f8f5]">Import CSV</Link>}
            <Link href="/feedback/new" className="inline-flex items-center gap-2 rounded-xl bg-[#1e5547] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174638]"><Plus size={16} /> Add feedback</Link>
          </div>}
        </div>

        <div className="mt-8 rounded-2xl border border-[#e0e8e2] bg-white p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_170px_160px_160px_160px]">
            <label className="relative block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a097]" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); resetPagination(); }} placeholder="Search feedback, author or URL"
                className="w-full rounded-xl border border-[#e2e9e3] bg-[#fcfdfb] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#477766]" />
            </label>
            <select aria-label="Filter by brand" value={brandId} onChange={(event) => { setBrandId(event.target.value); resetPagination(); }}
              className="rounded-xl border border-[#e2e9e3] bg-white px-3 py-3 text-sm outline-none focus:border-[#477766]">
              <option value="">All brands</option>
              {(brandsQuery.data ?? []).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            <select aria-label="Filter by sentiment" value={sentiment} onChange={(event) => { setSentiment(event.target.value); resetPagination(); }}
              className="rounded-xl border border-[#e2e9e3] bg-white px-3 py-3 text-sm outline-none focus:border-[#477766]">
              <option value="">All sentiment</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEGATIVE">Negative</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="UNKNOWN">Unclassified</option>
            </select>
            <select aria-label="Filter by topic" value={topicId} onChange={(event) => { setTopicId(event.target.value); resetPagination(); }}
              className="rounded-xl border border-[#e2e9e3] bg-white px-3 py-3 text-sm outline-none focus:border-[#477766]">
              <option value="">All topics</option>
              {(topicsQuery.data ?? []).map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); resetPagination(); }}
              className="rounded-xl border border-[#e2e9e3] bg-white px-3 py-3 text-sm outline-none focus:border-[#477766]">
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-[#829087]">
            <span className="inline-flex items-center gap-2"><SlidersHorizontal size={14} /> Filters apply to this organization</span>
            <span>{feedbackQuery.data ? `${items.length} shown` : " "}</span>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#e0e8e2] bg-white">
          {feedbackQuery.isPending ? (
            <div className="space-y-4 p-6">{[1,2,3].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-[#f3f6f3]" />)}</div>
          ) : feedbackQuery.isError ? (
            <div role="alert" className="p-10 text-center"><p className="font-semibold">We couldn't load feedback.</p><p className="mt-2 text-sm text-[#829087]">Check your connection and try again.</p><button onClick={() => void feedbackQuery.refetch()} className="mt-4 text-sm font-semibold text-[#1e5547]">Retry</button></div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f0f5f1] text-[#477766]"><Inbox size={22} /></span>
              <h2 className="mt-4 font-semibold">{search || brandId || sentiment || topicId ? "No feedback matches these filters" : "Your inbox is ready"}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#829087]">{search || brandId || sentiment || topicId ? "Try changing or clearing your filters." : "Add your first customer feedback item. CSV and URL imports will be added in the next capture milestone."}</p>
              {canManage && !search && !brandId && !sentiment && !topicId && <Link href="/feedback/new" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e5547] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={15} /> Add feedback</Link>}
            </div>
          ) : (
            <div className="divide-y divide-[#edf1ed]">
              {items.map((item) => (
                <Link key={item.id} href={`/feedback/${item.id}`} className="block px-5 py-5 transition hover:bg-[#fbfcfa] sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${sentimentStyles[item.sentiment]}`}>{item.sentiment.toLowerCase()}</span>
                    <span className="text-xs text-[#829087]">{item.brand.name}</span>
                    <span className="text-[#c1cbc4]">·</span>
                    <span className="text-xs text-[#829087]">{item.source.name}</span>
                    <span className="ml-auto text-xs text-[#9aa69e]">{formatDate(item.publishedAt ?? item.createdAt)}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#31443a]">{item.originalContent}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.authorDisplayName && <span className="text-xs font-medium text-[#65756b]">{item.authorDisplayName}</span>}
                    {item.topicAssignments.slice(0, 3).map(({ topic }) => <span key={topic.id} className="rounded-md bg-[#f3f6f3] px-2 py-1 text-[10px] text-[#718078]">{topic.name}</span>)}
                    {item.assignedTo && <span className="ml-auto text-xs text-[#829087]">Assigned to {item.assignedTo.name}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-[#edf1ed] px-5 py-4">
            <button disabled={cursors.length === 0} onClick={() => setCursors((current) => current.slice(0, -1))}
              className="inline-flex items-center gap-2 rounded-lg border border-[#dce5df] px-3 py-2 text-xs font-medium text-[#52675c] disabled:opacity-40"><ArrowLeft size={14} /> Previous</button>
            <span className="text-xs text-[#829087]">Page {cursors.length + 1}</span>
            <button disabled={!feedbackQuery.data?.page.hasMore || !feedbackQuery.data.page.nextCursor}
              onClick={() => { if (feedbackQuery.data?.page.nextCursor) setCursors((current) => [...current, feedbackQuery.data!.page.nextCursor!]); }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#dce5df] px-3 py-2 text-xs font-medium text-[#52675c] disabled:opacity-40">Next <ArrowRight size={14} /></button>
          </div>
        </div>
      </section>
    </main>
  );
}
