"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Inbox, MessageSquareQuote, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";

const pillars = [
  { icon: Inbox, title: "Capture", description: "Bring feedback into one searchable workspace." },
  { icon: Sparkles, title: "Understand", description: "Find themes and sentiment backed by real feedback." },
  { icon: Activity, title: "Improve", description: "Turn recurring customer problems into action." },
  { icon: MessageSquareQuote, title: "Showcase", description: "Publish approved customer stories with confidence." },
];

export default function HomePage() {
  const router = useRouter();
  const { status, organizations } = useAuth();

  useEffect(() => {
    if (status === "authenticated") router.replace(organizations.length ? "/workspace" : "/onboarding");
  }, [status, organizations.length, router]);

  if (status === "loading" || status === "authenticated") {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-sm text-[#718078]">Loading Signalnest…</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#17231f]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#1e5547] text-sm text-white">S</span>
          <span className="text-lg">signalnest</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#52675c] transition hover:bg-white">Sign in</Link>
          <Link href="/register" className="rounded-xl bg-[#1e5547] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174638]">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-14 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:pt-24">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#477766]">
            <span className="size-2 rounded-full bg-[#6d9e83]" /> Customer voice, made actionable
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl">
            Every customer signal deserves a response.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#66766f]">
            Signalnest brings customer feedback together, finds the patterns that matter,
            and helps your team turn good experiences into lasting proof.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#1e5547] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#174638]">
              Create your workspace <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="rounded-xl border border-[#dce5df] bg-white px-5 py-3 text-sm font-medium text-[#314a40] transition hover:bg-[#f0f4f1]">
              Sign in
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e0e8e2] bg-white p-6 shadow-[0_24px_80px_-48px_rgba(31,69,54,.35)] sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-[#edf1ed] pb-6">
            <div><p className="text-sm font-medium text-[#718078]">The Signalnest workflow</p><h2 className="mt-1 text-xl font-semibold tracking-tight">From feedback to forward motion</h2></div>
            <span className="rounded-lg bg-[#f0f5f1] p-2 text-[#477766]"><Sparkles size={18} /></span>
          </div>
          <div className="grid gap-3 pt-6 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-[#edf1ed] bg-[#fbfcfa] p-4">
                <Icon size={18} className="text-[#477766]" />
                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#77857e]">{description}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-[#829087]">A focused customer voice platform for teams that want to listen, learn and improve.</p>
        </div>
      </section>
    </main>
  );
}
