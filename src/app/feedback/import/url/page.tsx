"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ExternalLink, Link2 } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { apiRequest, ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

type Brand = { id: string; name: string };
type UrlPreview = {
  id: string;
  status: "PREVIEWED";
  fileName: string;
  validRows: number;
  preview: { originalContent: string; sourceUrl: string; authorDisplayName?: string; publishedAt?: string }[];
};
type ImportStatus = {
  id: string;
  status: "PREVIEWED" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  validRows: number;
  processedRows: number;
  failureReason: string | null;
};

export default function UrlCapturePage() {
  const queryClient = useQueryClient();
  const { status, organizations } = useAuth();
  const organization = organizations[0];
  const [brandId, setBrandId] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [preview, setPreview] = useState<UrlPreview | null>(null);
  const [importJobId, setImportJobId] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const brandsQuery = useQuery({
    queryKey: organization ? queryKeys.brands.list(organization.id) : ["brands", "none"],
    queryFn: () => apiRequest<Brand[]>(`/brands?organizationId=${organization!.id}`),
    enabled: status === "authenticated" && Boolean(organization),
  });

  const importStatusQuery = useQuery({
    queryKey: importJobId ? queryKeys.imports.detail(importJobId) : ["imports", "none"],
    queryFn: () => apiRequest<ImportStatus>(`/feedback/import/${importJobId}`),
    enabled: Boolean(importJobId),
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      return currentStatus === "QUEUED" || currentStatus === "PROCESSING" ? 1500 : false;
    },
  });

  useEffect(() => {
    if (importStatusQuery.data?.status === "COMPLETED") {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
    }
  }, [importStatusQuery.data?.status, queryClient]);

  async function createPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization || !brandId) return;
    setError("");
    setPending(true);
    setPreview(null);
    setImportJobId("");
    try {
      const result = await apiRequest<UrlPreview>("/feedback/import/url", {
        method: "POST",
        body: {
          organizationId: organization.id,
          brandId,
          url,
          originalContent: content,
          authorDisplayName: author || undefined,
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        },
      });
      setPreview(result);
      setImportJobId(result.id);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to prepare this URL capture.");
    } finally {
      setPending(false);
    }
  }

  async function confirmCapture() {
    if (!importJobId) return;
    setError("");
    setConfirming(true);
    try {
      await apiRequest(`/feedback/import/${importJobId}/confirm`, { method: "POST" });
      await importStatusQuery.refetch();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to queue this capture.");
    } finally {
      setConfirming(false);
    }
  }

  if (status !== "authenticated" || !organization) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Loading…</main>;
  }

  const canCapture = ["OWNER", "ADMIN", "MANAGER"].includes(organization.role);
  const currentStatus = importStatusQuery.data?.status ?? preview?.status;

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-6 py-8 text-[#17231f]">
      <div className="mx-auto max-w-3xl">
        <Link href="/feedback" className="inline-flex items-center gap-2 text-sm text-[#718078] hover:text-[#1e5547]"><ArrowLeft size={15} /> Back to inbox</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#477766]">Feedback capture</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Capture feedback from a URL</h1>
        <p className="mt-2 text-sm leading-6 text-[#718078]">Save a customer review or public feedback page with its original link. Signalnest stores the content you provide and does not scrape the page automatically.</p>

        {!canCapture ? (
          <div className="mt-7 rounded-2xl border border-[#e0e8e2] bg-white p-6 text-sm text-[#718078]">URL captures are available to organization owners, admins and managers.</div>
        ) : (
          <form onSubmit={createPreview} className="mt-7 space-y-5 rounded-3xl border border-[#e0e8e2] bg-white p-6 sm:p-8">
            <div>
              <label htmlFor="brand" className="mb-2 block text-sm font-medium">Brand</label>
              <select id="brand" required value={brandId} onChange={(event) => setBrandId(event.target.value)}
                className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none focus:border-[#477766]">
                <option value="">Choose a brand</option>
                {(brandsQuery.data ?? []).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="url" className="mb-2 block text-sm font-medium">Original URL</label>
              <input id="url" type="url" required maxLength={2048} value={url} onChange={(event) => setUrl(event.target.value)}
                placeholder="https://reviews.example.com/…"
                className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none focus:border-[#477766]" />
            </div>
            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-medium">Customer feedback</label>
              <textarea id="content" required rows={6} maxLength={20000} value={content} onChange={(event) => setContent(event.target.value)}
                placeholder="Paste the review or feedback text exactly as it appears…"
                className="w-full resize-y rounded-xl border border-[#dce5df] px-4 py-3 text-sm leading-6 outline-none focus:border-[#477766]" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="author" className="mb-2 block text-sm font-medium">Author <span className="font-normal text-[#8a968f]">· optional</span></label>
                <input id="author" maxLength={160} value={author} onChange={(event) => setAuthor(event.target.value)}
                  className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none focus:border-[#477766]" placeholder="Customer name" />
              </div>
              <div>
                <label htmlFor="publishedAt" className="mb-2 block text-sm font-medium">Published date <span className="font-normal text-[#8a968f]">· optional</span></label>
                <input id="publishedAt" type="date" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)}
                  className="w-full rounded-xl border border-[#dce5df] px-4 py-3 text-sm outline-none focus:border-[#477766]" />
              </div>
            </div>
            <p className="rounded-xl bg-[#f7f9f6] px-4 py-3 text-xs leading-5 text-[#718078]">Only HTTP and HTTPS links are accepted. The original content is stored separately from its source URL.</p>
            {error && <p role="alert" className="rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{error}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={pending || !brandId || !url || !content.trim()} className="rounded-xl bg-[#1e5547] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174638] disabled:opacity-50">{pending ? "Preparing capture…" : "Preview capture"}</button>
            </div>
          </form>
        )}

        {preview && (
          <section className="mt-6 rounded-3xl border border-[#e0e8e2] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Review before saving</h2>
            <div className="mt-5 rounded-2xl bg-[#f7f9f6] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#31443a]">{preview.preview[0].originalContent}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#718078]">
                <Link2 size={14} />
                <a href={preview.preview[0].sourceUrl} target="_blank" rel="noreferrer" className="break-all hover:text-[#1e5547]">{preview.preview[0].sourceUrl}</a>
                <ExternalLink size={12} />
              </div>
              {preview.preview[0].authorDisplayName && <p className="mt-3 text-xs text-[#829087]">By {preview.preview[0].authorDisplayName}</p>}
            </div>
            {error && <p role="alert" className="mt-4 rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{error}</p>}
            {currentStatus === "PREVIEWED" && <div className="mt-6 flex justify-end"><button onClick={() => void confirmCapture()} disabled={confirming} className="inline-flex items-center gap-2 rounded-xl bg-[#1e5547] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 size={16} /> {confirming ? "Confirming…" : "Confirm and save"}</button></div>}
            {(currentStatus === "QUEUED" || currentStatus === "PROCESSING") && <p className="mt-6 rounded-xl bg-[#f0f5f1] p-4 text-sm text-[#477766]">Capture queued. {importStatusQuery.data?.processedRows ?? 0} of 1 item processed.</p>}
            {currentStatus === "COMPLETED" && <p className="mt-6 rounded-xl bg-[#edf6ef] p-4 text-sm font-medium text-[#3d7955]">URL capture saved. <Link href="/feedback" className="ml-2 underline">Open inbox</Link></p>}
            {currentStatus === "FAILED" && <p role="alert" className="mt-6 rounded-xl bg-[#fff5f1] p-4 text-sm text-[#a44d42]">{importStatusQuery.data?.failureReason || "The capture failed."}</p>}
          </section>
        )}
      </div>
    </main>
  );
}
