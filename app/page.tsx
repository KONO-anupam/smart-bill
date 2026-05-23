import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-black">
            InvoiceFlow
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-black transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold bg-black text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-black leading-tight max-w-3xl mx-auto">
          Send an invoice in 60 seconds.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Paste a line of text. InvoiceFlow parses your client, line items, and
          rates automatically. Your client gets a clean payment link. You get
          paid.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto text-base font-semibold bg-black text-white px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Create Your First Invoice
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto text-base font-semibold border border-slate-300 text-slate-700 px-8 py-3.5 rounded-xl hover:border-slate-500 hover:text-black transition-colors"
          >
            See How It Works
          </Link>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="text-green-500">✓</span> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-500">✓</span> Invoice sent in under 60 seconds
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-500">✓</span> Free forever for solo freelancers
          </span>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="bg-slate-50 border-y border-slate-200 py-24"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-black mb-16">
            Three steps. Zero friction.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Paste or type",
                body: "Describe your work in plain English. InvoiceFlow extracts your client details and line items.",
              },
              {
                step: "2",
                title: "Review and send",
                body: "Confirm the parsed invoice in a live preview. Hit Generate — your invoice gets a permanent, shareable URL.",
              },
              {
                step: "3",
                title: "Client pays, you know instantly",
                body: "Your client opens the link, reviews the invoice, and pays. Your dashboard updates in real time.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-black shrink-0">
                  {step}
                </div>
                <h3 className="text-xl font-bold text-black">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-black mb-16">
            Built for how freelancers actually work.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "✦",
                title: "Smart Text Import",
                body: "Type naturally. InvoiceFlow parses names, emails, quantities, and rates from a single sentence.",
              },
              {
                icon: "◎",
                title: "Live Invoice Preview",
                body: "See exactly what your client will see as you type. No surprises.",
              },
              {
                icon: "⬡",
                title: "Permanent Invoice URLs",
                body: "Every invoice lives at its own URL. Share it anywhere — email, WhatsApp, Notion, wherever.",
              },
              {
                icon: "⚡",
                title: "Real-Time Payment Status",
                body: "The moment your client pays, your invoice flips to Paid. No refresh needed.",
              },
              {
                icon: "◻",
                title: "Print-Perfect PDF",
                body: "One click exports a clean, print-ready PDF. Letterhead, line items, totals — all formatted correctly.",
              },
              {
                icon: "◈",
                title: "Your Branding, Always",
                body: "Your company name, email, and logo on every invoice. Looks like you built the billing system yourself.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col gap-3 hover:border-slate-400 transition-colors"
              >
                <span className="text-2xl">{icon}</span>
                <h3 className="text-lg font-bold text-black">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="bg-slate-50 border-y border-slate-200 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-black mb-16">
            Used by freelancers who hate paperwork.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "I sent my first invoice 90 seconds after signing up. I didn't even read any docs.",
                name: "Alex R.",
                role: "Freelance Developer",
              },
              {
                quote:
                  "My clients actually compliment the invoice design. I've never had that happen before.",
                name: "Priya M.",
                role: "Independent Consultant",
              },
              {
                quote:
                  "The smart import is witchcraft. I paste my project notes and it just... knows.",
                name: "Tom W.",
                role: "Motion Designer",
              },
            ].map(({ quote, name, role }) => (
              <div
                key={name}
                className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between gap-6 shadow-sm"
              >
                <p className="text-slate-700 leading-relaxed text-base">
                  &ldquo;{quote}&rdquo;
                </p>
                <div>
                  <p className="font-bold text-black text-sm">{name}</p>
                  <p className="text-slate-400 text-sm">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 bg-black text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl sm:text-5xl font-black leading-tight">
            Your next invoice is 60 seconds away.
          </h2>
          <p className="mt-5 text-lg text-slate-400">
            No templates. No tutorials. Just paste and send.
          </p>
          <Link
            href="/login"
            className="inline-block mt-10 text-base font-semibold bg-white text-black px-10 py-4 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Start Free — No Card Required
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© 2025 InvoiceFlow. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}