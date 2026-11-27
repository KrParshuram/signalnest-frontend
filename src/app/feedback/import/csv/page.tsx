"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, FileSpreadsheet, UploadCloud } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { apiRequest, ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

type Brand = { id: string; name: string };
type PreviewRow = {
  originalContent: string;
  authorDisplayName?: string;
  sourceUrl?: string;
  publishedAt?: string;
  externalId?: string;
};
type RowError = { rowNumber: number; reason: string };
type PreviewResponse = {
  id: string;
  status: "PREVIEWED";
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: RowError[];
  preview: PreviewRow[];
};
type ImportStatus = {
  id: string;
  status: "PREVIEWED" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  totalRows: number;
  validRows: number;
  invalidRows: number;
  processedRows: number;
  failureReason: string | null;
  completedAt: string | null;
};

export default function CsvImportPage() {
  const queryClient = useQueryClient();
  const { status, organizations } = useAuth();
  const organization = organizations[0];
  const [brandId, setBrandId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
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
    if (!organization || !file || !brandId) return;
    setError("");
    setPending(true);
    setPreview(null);
    setImportJobId("");
    try {
      const formData = new FormData();
      formData.set("organizationId", organization.id);
      formData.set("brandId", brandId);
      formData.set("file", file);
      const result = await apiRequest<PreviewResponse>("/feedback/import/csv", {
        method: "POST",
        body: formData,
        retryOnUnauthorized: true,
      });
      setPreview(result);
      setImportJobId(result.id);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to preview this CSV file.");
    } finally {
      setPending(false);
    }
  }

  async function confirmImport() {
    if (!importJobId) return;
    setError("");
    setConfirming(true);
    try {
      await apiRequest(`/feedback/import/${importJobId}/confirm`, { method: "POST" });
      await importStatusQuery.refetch();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to queue this import.");
    } finally {
      setConfirming(false);
    }
  }

  if (status !== "authenticated" || !organization) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Loading…</main>;
  }

  const canImport = ["OWNER", "ADMIN", "MANAGER"].includes(organization.role);
  const importStatus = importStatusQuery.data?.status ?? preview?.status;

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-6 py-8 text-[#17231f]">
      <div className="mx-auto max-w-5xl">
        <Link href="/feedback" className="inline-flex items-center gap-2 text-sm text-[#718078] hover:text-[#1e5547]"><ArrowLeft size={15} /> Back to inbox</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#477766]">Feedback capture</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Import feedback from CSV</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718078]">Upload a CSV, review the rows that can be imported, then confirm. Nothing is added to your inbox until you confirm.</p>

        {!canImport ? (
          <div className="mt-7 rounded-2xl border border-[#e0e8e2] bg-white p-6 text-sm text-[#718078]">CSV imports are available to organization owners, admins and managers.</div>
        ) : (
          <form onSubmit={createPreview} className="mt-7 rounded-3xl border border-[#e0e8e2] bg-white p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="brand" className="mb-2 block text-sm font-medium">Import into brand</label>
                <select id="brand" required value={brandId} onChange={(event) => setBrandId(event.target.value)}
                  className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm outline-none focus:border-[#477766]">
                  <option value="">Choose a brand</option>
                  {(brandsQuery.data ?? []).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="csvFile" className="mb-2 block text-sm font-medium">CSV file</label>
                <input id="csvFile" type="file" accept=".csv,text/csv" required
                  onChange={(event) => { setFile(event.target.files?.[0] ?? null); setPreview(null); setImportJobId(""); }}
                  className="block w-full rounded-xl border border-[#dce5df] bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#f0f5f1] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#477766]" />
                <p className="mt-1 text-xs text-[#8a968f]">CSV only · 5 MB maximum · 1,000 rows per import</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#f7f9f6] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><FileSpreadsheet size={17} className="text-[#477766]" /> Supported columns</div>
              <p className="mt-2 text-xs leading-5 text-[#718078]">Required: <code>content</code>, <code>feedback</code>, <code>review</code> or <code>message</code>. Optional: <code>author</code>, <code>source_url</code>, <code>published_at</code>, <code>external_id</code>.</p>
            </div>

            {error && <p role="alert" className="mt-5 rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={pending || !brandId || !file || brandsQuery.isPending || file.size > 5 * 1024 * 1024}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e5547] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174638] disabled:cursor-not-allowed disabled:opacity-50">
                <UploadCloud size={16} /> {pending ? "Validating CSV…" : "Preview import"}
              </button>
            </div>
          </form>
        )}

        {preview && (
          <section className="mt-6 rounded-3xl border border-[#e0e8e2] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h2 className="text-lg font-semibold">Import preview</h2><p className="mt-1 text-xs text-[#829087]">{preview.fileName}</p></div>
              <span className="rounded-full bg-[#f0f5f1] px-3 py-1.5 text-xs font-semibold text-[#477766]">Review before confirming</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#f7f9f6] p-3"><p className="text-xs text-[#829087]">Total rows</p><p className="mt-1 text-2xl font-semibold tabular-nums">{preview.totalRows}</p></div>
              <div className="rounded-xl bg-[#edf6ef] p-3"><p className="text-xs text-[#477766]">Valid</p><p className="mt-1 text-2xl font-semibold tabular-nums text-[#3d7955]">{preview.validRows}</p></div>
              <div className="rounded-xl bg-[#fff5f1] p-3"><p className="text-xs text-[#a44d42]">Skipped</p><p className="mt-1 text-2xl font-semibold tabular-nums text-[#a44d42]">{preview.invalidRows}</p></div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold">Valid feedback preview</h3>
              <div className="mt-3 divide-y divide-[#edf1ed] rounded-xl border border-[#edf1ed]">
                {preview.preview.map((row, index) => (
                  <div key={index} className="p-4">
                    <p className="line-clamp-2 text-sm leading-6 text-[#31443a]">{row.originalContent}</p>
                    <p className="mt-2 text-xs text-[#829087]">{row.authorDisplayName || "Author not provided"}{row.publishedAt ? " · " + new Date(row.publishedAt).toLocaleDateString() : ""}</p>
                  </div>
                ))}
              </div>
              {preview.validRows > preview.preview.length && <p className="mt-2 text-xs text-[#829087]">Showing first {preview.preview.length} of {preview.validRows} valid rows.</p>}
            </div>

            {preview.errors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold">Rows that will be skipped</h3>
                <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
                  {preview.errors.map((item) => <p key={item.rowNumber} className="rounded-lg bg-[#fff7f5] px-3 py-2 text-xs text-[#9b5148]">Row {item.rowNumber}: {item.reason}</p>)}
                </div>
              </div>
            )}

            {error && <p role="alert" className="mt-5 rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{error}</p>}
            {importStatus === "PREVIEWED" && (
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] pt-5">
                <p className="text-xs text-[#829087]">Only {preview.validRows} valid rows will be queued.</p>
                <button onClick={() => void confirmImport()} disabled={confirming} className="inline-flex items-center gap-2 rounded-xl bg-[#1e5547] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  <CheckCircle2 size={16} /> {confirming ? "Confirming…" : "Confirm and import"}
                </button>
              </div>
            )}
            {(importStatus === "QUEUED" || importStatus === "PROCESSING") && (
              <div className="mt-7 rounded-xl bg-[#f0f5f1] p-4 text-sm text-[#477766]">
                Import {importStatus.toLowerCase()}. {importStatusQuery.data?.processedRows ?? 0} of {preview.validRows} rows processed. This page will update automatically.
              </div>
            )}
            {importStatus === "COMPLETED" && (
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#edf6ef] p-4">
                <p className="text-sm font-medium text-[#3d7955]">Import complete. Your feedback is now in the inbox.</p>
                <Link href="/feedback" className="text-sm font-semibold text-[#1e5547]">Open inbox →</Link>
              </div>
            )}
            {importStatus === "FAILED" && <p role="alert" className="mt-7 rounded-xl bg-[#fff5f1] p-4 text-sm text-[#a44d42]">{importStatusQuery.data?.failureReason || "The import failed. You can upload the file again."}</p>}
          </section>
        )}
      </div>
    </main>
  );
}
