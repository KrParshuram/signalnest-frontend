import Link from "next/link";
import type { ReactNode } from "react";

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#17231f]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#1e5547] text-sm text-white">S</span>
          <span className="text-lg">signalnest</span>
        </Link>
        <Link href="/" className="text-sm text-[#718078] transition hover:text-[#1e5547]">Back to home</Link>
      </header>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1fr_440px] lg:items-center lg:gap-20 lg:px-10 lg:pt-16">
        <div className="hidden max-w-xl lg:block">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#477766]">{eyebrow}</p>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.055em]">{title}</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#66766f]">{description}</p>
          <div className="mt-12 grid grid-cols-2 gap-3">
            {[
              ["Capture", "Bring feedback into one place"],
              ["Understand", "Find patterns in customer voice"],
              ["Improve", "Turn insight into action"],
              ["Showcase", "Put approved praise to work"],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-2xl border border-[#e3eae4] bg-white/70 p-4">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs leading-5 text-[#77857e]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full rounded-3xl border border-[#e0e8e2] bg-white p-7 shadow-[0_24px_80px_-48px_rgba(31,69,54,.35)] sm:p-9">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#477766]">Signalnest account</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#718078]">{description}</p>
          </div>
          {children}
          <div className="mt-7 border-t border-[#edf1ed] pt-5 text-sm text-[#718078]">{footer}</div>
        </div>
      </section>
    </main>
  );
}
