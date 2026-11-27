"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-provider";
import { apiRequest, ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

type Brand = { id: string; name: string };
type Topic = { id: string; name: string };
type CreatedFeedback = { id: string };

export default function NewFeedbackPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status, organizations } = useAuth();
  const organization = organizations[0];
  const [brandId, setBrandId] = useState("");
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

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
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) return;
    setError("");
    setPending(true);
    try {
      const result = await apiRequest<CreatedFeedback>("/feedback", {
        method: "POST",
        body: {
          organizationId: organization.id,
          brandId,
          originalContent: content,
          topicIds,
          authorDisplayName: author || undefined,
          sourceUrl: sourceUrl || undefined,
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        },
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
      router.replace(`/feedback/${result.id}`);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "We couldn't save this feedback. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (status !== "authenticated" || !organization) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Loading…</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-6 py-8 text-[#17231f]">
      <div className="mx-auto max-w-3xl">
        <Link href="/feedback" className="inline-flex items-center gap-2 text-sm text-[#718078] hover:text-[#1e5547]"><ArrowLeft size={15} /> Back to inbox</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#477766]">Feedback capture</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Add customer feedback</h1>
        <p className="mt-2 text-sm text-[#718078]">Save the customer's original words and preserve where they came from.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5 rounded-3xl border border-[#e0e8e2] bg-white p-6 sm:p-8">
          <div>
            <label htmlFor="brand" className="mb-2 block text-sm font-medium">Brand</label>
            <select id="brand" required value={brandId} onChange={(event) => setBrandId(event.target.value)}
              className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none focus:border-[#477766]">
              <option value="">Choose a brand</option>
              {(brandsQuery.data ?? []).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            {brandsQuery.isError && <p className="mt-2 text-xs text-[#a44d42]">Unable to load brands. Refresh and try again.</p>}
          </div>
          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium">Original feedback</label>
            <textarea id="content" required minLength={1} maxLength={20000} rows={7} value={content}
              onChange={(event) => setContent(event.target.value)} placeholder="Paste the customer's feedback exactly as it was received…"
              className="w-full resize-y rounded-xl border border-[#dce5df] px-4 py-3 text-sm leading-6 outline-none focus:border-[#477766] focus:ring-4 focus:ring-[#477766]/10" />
            <p className="mt-1 text-right text-xs text-[#9aa69e]">{content.length.toLocaleString()} / 20,000</p>
          </div>
          <div>
            <label htmlFor="topics" className="mb-2 block text-sm font-medium">Topics <span className="font-normal text-[#8a968f]">· optional</span></label>
            <select id="topics" multiple value={topicIds} onChange={(event) => setTopicIds(Array.from(event.target.selectedOptions, (option) => option.value))}
              className="min-h-32 w-full rounded-xl border border-[#dce5df] bg-white px-3 py-2 text-sm outline-none focus:border-[#477766]">
              {(topicsQuery.data ?? []).map((topic) => <option key={topic.id} value={topic.id} className="rounded-md px-2 py-1">{topic.name}</option>)}
            </select>
            <p className="mt-1 text-xs text-[#8a968f]">Select multiple topics using Ctrl (Windows) or Command (Mac).</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="author" className="mb-2 block text-sm font-medium">Author / display name <span className="font-normal text-[#8a968f]">· optional</span></label>
              <input id="author" maxLength={160} value={author} onChange={(event) => setAuthor(event.target.value)}
                placeholder="Customer name"
                className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none focus:border-[#477766]" />
            </div>
            <div>
              <label htmlFor="publishedAt" className="mb-2 block text-sm font-medium">Published date <span className="font-normal text-[#8a968f]">· optional</span></label>
              <input id="publishedAt" type="date" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)}
                className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none focus:border-[#477766]" />
            </div>
          </div>
          <div>
            <label htmlFor="sourceUrl" className="mb-2 block text-sm font-medium">Original source URL <span className="font-normal text-[#8a968f]">· optional</span></label>
            <input id="sourceUrl" type="url" maxLength={2048} value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none focus:border-[#477766]" />
          </div>
          <div className="rounded-xl bg-[#f6f8f5] px-4 py-3 text-xs leading-5 text-[#718078]">
            Original feedback is preserved as submitted. You can add internal notes and metadata later without rewriting the source content.
          </div>
          {error && <p role="alert" className="rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={pending || !brandId || !content.trim() || brandsQuery.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e5547] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174638] disabled:cursor-not-allowed disabled:opacity-50">
              <Save size={15} /> {pending ? "Saving feedback…" : "Save feedback"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
