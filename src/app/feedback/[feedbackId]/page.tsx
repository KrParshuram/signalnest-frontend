"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Archive, ExternalLink, MessageSquare, RotateCcw, Send } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { apiRequest, ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

type FeedbackDetail = {
  id: string;
  organizationId: string;
  originalContent: string;
  authorDisplayName: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  importedAt: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  status: "ACTIVE" | "ARCHIVED";
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNKNOWN";
  summary: string | null;
  brand: { id: string; name: string };
  source: { id: string; name: string; type: string };
  assignedTo: { id: string; name: string; email: string } | null;
  topicAssignments: { topic: { id: string; name: string; slug: string } }[];
  notes: { id: string; body: string; createdAt: string; user: { id: string; name: string } }[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function FeedbackDetailPage() {
  const params = useParams<{ feedbackId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status, organizations } = useAuth();
  const organization = organizations[0];
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [actionError, setActionError] = useState("");
  const canManage = organization?.role !== "VIEWER";

  const feedbackQuery = useQuery({
    queryKey: organization ? queryKeys.feedback.detail(organization.id, params.feedbackId) : ["feedback", params.feedbackId],
    queryFn: () => apiRequest<FeedbackDetail>(`/feedback/${params.feedbackId}`),
    enabled: status === "authenticated" && Boolean(organization) && Boolean(params.feedbackId),
  });

  const feedback = feedbackQuery.data;

  const noteMutation = useMutation({
    mutationFn: (body: string) => apiRequest(`/feedback/${params.feedbackId}/notes`, { method: "POST", body: { body } }),
    onSuccess: async () => {
      setNote("");
      setNoteError("");
      await queryClient.invalidateQueries({ queryKey: organization ? queryKeys.feedback.detail(organization.id, params.feedbackId) : ["feedback"] });
    },
    onError: (error) => setNoteError(error instanceof ApiError ? error.message : "Unable to add note."),
  });

  const statusMutation = useMutation({
    mutationFn: (nextStatus: "archive" | "restore") => apiRequest(`/feedback/${params.feedbackId}/${nextStatus}`, { method: "POST" }),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: organization ? queryKeys.feedback.detail(organization.id, params.feedbackId) : ["feedback"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
    onError: (error) => setActionError(error instanceof ApiError ? error.message : "Unable to update feedback status."),
  });

  async function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (note.trim()) noteMutation.mutate(note.trim());
  }

  if (status !== "authenticated" || !organization) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Loading feedback…</main>;
  }

  if (feedbackQuery.isPending) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Loading feedback details…</main>;
  }

  if (feedbackQuery.isError || !feedback) {
    return <main className="min-h-screen bg-[#f7f8f6] p-8 text-center"><p className="font-semibold">Feedback not found</p><Link href="/feedback" className="mt-4 inline-block text-sm text-[#1e5547]">Return to inbox</Link></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-6 py-8 text-[#17231f]">
      <div className="mx-auto max-w-5xl">
        <Link href="/feedback" className="inline-flex items-center gap-2 text-sm text-[#718078] hover:text-[#1e5547]"><ArrowLeft size={15} /> Back to inbox</Link>
        <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#477766]">{feedback.brand.name} · {feedback.source.name}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Feedback details</h1>
            <p className="mt-2 text-sm text-[#829087]">Captured {formatDate(feedback.importedAt)}</p>
          </div>
          {canManage && (
            <button onClick={() => statusMutation.mutate(feedback.status === "ARCHIVED" ? "restore" : "archive")}
              disabled={statusMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-[#dce5df] bg-white px-4 py-2.5 text-sm font-medium text-[#52675c] transition hover:bg-[#f4f7f4] disabled:opacity-50">
              {feedback.status === "ARCHIVED" ? <RotateCcw size={15} /> : <Archive size={15} />}
              {statusMutation.isPending ? "Saving…" : feedback.status === "ARCHIVED" ? "Restore" : "Archive"}
            </button>
          )}
        </div>

        {actionError && <p role="alert" className="mt-4 rounded-xl border border-[#f0d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b4338]">{actionError}</p>}

        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#e0e8e2] bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Original customer feedback</h2>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${feedback.sentiment === "POSITIVE" ? "bg-[#edf6ef] text-[#3d7955]" : feedback.sentiment === "NEGATIVE" ? "bg-[#fff0ed] text-[#a44d42]" : "bg-[#f1f3f2] text-[#64716a]"}`}>{feedback.sentiment.toLowerCase()}</span>
              </div>
              <blockquote className="mt-6 whitespace-pre-wrap text-base leading-8 text-[#31443a]">{feedback.originalContent}</blockquote>
              {feedback.sourceUrl && <a href={feedback.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#477766] hover:underline">Open original source <ExternalLink size={14} /></a>}
            </section>

            <section className="rounded-2xl border border-[#e0e8e2] bg-white p-6">
              <div className="flex items-center gap-2"><MessageSquare size={17} className="text-[#477766]" /><h2 className="font-semibold">Internal notes</h2></div>
              <div className="mt-5 space-y-4">
                {feedback.notes.length === 0 ? <p className="text-sm text-[#829087]">No internal notes yet.</p> : feedback.notes.map((item) => (
                  <article key={item.id} className="rounded-xl bg-[#f7f9f6] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[#43554a]">{item.body}</p>
                    <p className="mt-3 text-xs text-[#829087]">{item.user.name} · {formatDate(item.createdAt)}</p>
                  </article>
                ))}
              </div>
              {canManage && (
                <form onSubmit={submitNote} className="mt-5 border-t border-[#edf1ed] pt-5">
                  <label htmlFor="note" className="mb-2 block text-sm font-medium">Add a private note</label>
                  <textarea id="note" rows={3} maxLength={5000} value={note} onChange={(event) => setNote(event.target.value)}
                    placeholder="Share context with your team…"
                    className="w-full resize-y rounded-xl border border-[#dce5df] px-4 py-3 text-sm leading-6 outline-none focus:border-[#477766]" />
                  {noteError && <p role="alert" className="mt-2 text-xs text-[#a44d42]">{noteError}</p>}
                  <div className="mt-3 flex justify-end">
                    <button type="submit" disabled={!note.trim() || noteMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#1e5547] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Send size={14} /> {noteMutation.isPending ? "Adding…" : "Add note"}</button>
                  </div>
                </form>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#e0e8e2] bg-white p-5">
              <h2 className="text-sm font-semibold">Record details</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div><dt className="text-xs text-[#829087]">Brand</dt><dd className="mt-1 font-medium">{feedback.brand.name}</dd></div>
                <div><dt className="text-xs text-[#829087]">Source</dt><dd className="mt-1 font-medium">{feedback.source.name} <span className="text-xs font-normal text-[#829087]">({feedback.source.type})</span></dd></div>
                <div><dt className="text-xs text-[#829087]">Author</dt><dd className="mt-1 font-medium">{feedback.authorDisplayName || "Not provided"}</dd></div>
                <div><dt className="text-xs text-[#829087]">Published</dt><dd className="mt-1 font-medium">{feedback.publishedAt ? formatDate(feedback.publishedAt) : "Not provided"}</dd></div>
                <div><dt className="text-xs text-[#829087]">Imported</dt><dd className="mt-1 font-medium">{formatDate(feedback.importedAt)}</dd></div>
                <div><dt className="text-xs text-[#829087]">Assigned to</dt><dd className="mt-1 font-medium">{feedback.assignedTo?.name || "Unassigned"}</dd></div>
                <div><dt className="text-xs text-[#829087]">Status</dt><dd className="mt-1 font-medium">{feedback.status.toLowerCase()}</dd></div>
              </dl>
            </section>
            <section className="rounded-2xl border border-[#e0e8e2] bg-white p-5">
              <h2 className="text-sm font-semibold">Topics</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {feedback.topicAssignments.length ? feedback.topicAssignments.map(({ topic }) => <span key={topic.id} className="rounded-lg bg-[#f1f5f1] px-2.5 py-1.5 text-xs text-[#62756a]">{topic.name}</span>) : <p className="text-xs text-[#829087]">No topics assigned yet. Classification is part of the AI processing milestone.</p>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
