import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SmartBill — Professional Invoicing for Freelancers",
  description:
    "Create, send, and get paid on professional invoices in under 60 seconds. Built for independent professionals who value their time.",
  alternates: {
    canonical: "https://smartbill.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SmartBill",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --paper: #FAFAF7;
          --ink: #111110;
          --ink-soft: #5C5C58;
          --ink-muted: #A8A8A2;
          --rule: #E2E2DC;
          --accent: #2A5F2A;
          --accent-light: #EEF4EE;
          --accent-text: #1E461E;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --font-mono: 'DM Mono', 'Courier New', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
        }

        /* ── NAV ── */
        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--paper);
          border-bottom: 1px solid var(--rule);
        }
        .nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .wordmark {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--ink);
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
        }
        .nav-links a:not(.btn-nav) {
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--ink-soft);
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-links a:hover { color: var(--ink); }
        .btn-nav {
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: var(--font-body);
          color: #FAFAF7;
          background: var(--ink);
          border: none;
          padding: 8px 20px;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s;
          letter-spacing: 0.01em;
          display: inline-block;
        }
        .btn-nav:hover { background: #2A2A28; }

        /* ── HERO ── */
        .hero {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 32px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: end;
          border-bottom: 1px solid var(--rule);
        }
        .hero-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .hero-headline {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 4.5vw, 3.75rem);
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -0.025em;
          color: var(--ink);
          margin-bottom: 28px;
        }
        .hero-headline em {
          font-style: italic;
          color: var(--accent);
        }
        .hero-body {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--ink-soft);
          max-width: 420px;
          margin-bottom: 40px;
          font-weight: 300;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--paper);
          background: var(--ink);
          padding: 14px 32px;
          text-decoration: none;
          transition: background 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover { background: #2A2A28; }
        .btn-ghost {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-soft);
          text-decoration: none;
          border-bottom: 1px solid var(--rule);
          padding-bottom: 2px;
          transition: color 0.15s, border-color 0.15s;
        }
        .btn-ghost:hover { color: var(--ink); border-color: var(--ink-soft); }

        /* Hero right — invoice mockup */
        .hero-right {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .invoice-mockup {
          background: white;
          border: 1px solid var(--rule);
          padding: 28px 32px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }
        .mockup-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--rule);
          margin-bottom: 20px;
        }
        .mockup-company {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--ink);
        }
        .mockup-email {
          font-size: 0.75rem;
          color: var(--ink-muted);
          margin-top: 2px;
        }
        .mockup-label {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink);
          text-align: right;
        }
        .mockup-number {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--ink-muted);
          text-align: right;
          margin-top: 4px;
        }
        .mockup-bill-to {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 6px;
        }
        .mockup-client {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--ink);
        }
        .mockup-items {
          margin-top: 20px;
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--rule);
        }
        .mockup-item-header {
          display: grid;
          grid-template-columns: 1fr 60px 70px 70px;
          padding: 8px 0;
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-muted);
          border-bottom: 1px solid var(--rule);
        }
        .mockup-item-header span:not(:first-child) { text-align: right; }
        .mockup-item-row {
          display: grid;
          grid-template-columns: 1fr 60px 70px 70px;
          padding: 9px 0;
          font-size: 0.8125rem;
          color: var(--ink-soft);
          border-bottom: 1px solid var(--rule);
        }
        .mockup-item-row:last-child { border-bottom: none; }
        .mockup-item-row span:not(:first-child) {
          text-align: right;
          font-family: var(--font-mono);
          font-size: 0.75rem;
        }
        .mockup-item-row span:last-child { color: var(--ink); font-weight: 500; }
        .mockup-total {
          display: flex;
          justify-content: flex-end;
          align-items: baseline;
          gap: 24px;
          padding-top: 16px;
        }
        .mockup-total-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink-soft);
        }
        .mockup-total-amount {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .paid-stamp {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-light);
          color: var(--accent-text);
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 10px;
          margin-top: 16px;
          border: 1px solid #C8DCC8;
        }
        .paid-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }

        /* ── STATS BAND ── */
        .stats-band {
          border-bottom: 1px solid var(--rule);
        }
        .stats-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .stat-item {
          padding: 36px 0;
          border-right: 1px solid var(--rule);
        }
        .stat-item:last-child { border-right: none; }
        .stat-item + .stat-item { padding-left: 40px; }
        .stat-number {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--ink);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.8125rem;
          color: var(--ink-muted);
          margin-top: 6px;
          font-weight: 400;
        }

        /* ── HOW IT WORKS ── */
        .section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 32px;
          border-bottom: 1px solid var(--rule);
        }
        .section-label {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--ink-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 48px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--rule);
        }
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .step {
          padding: 0 40px 0 0;
          border-right: 1px solid var(--rule);
        }
        .step:last-child { border-right: none; padding-right: 0; }
        .step + .step { padding-left: 40px; }
        .step-num {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 900;
          color: var(--rule);
          line-height: 1;
          margin-bottom: 16px;
          letter-spacing: -0.04em;
        }
        .step-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .step-body {
          font-size: 0.9375rem;
          line-height: 1.65;
          color: var(--ink-soft);
          font-weight: 300;
        }

        /* ── FEATURES ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
        }
        .feature {
          padding: 36px 40px;
          border-right: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }
        .feature:nth-child(even) { border-right: none; }
        .feature:nth-last-child(-n+2) { border-bottom: none; }
        .feature-icon {
          width: 32px;
          height: 32px;
          color: var(--accent);
          margin-bottom: 16px;
        }
        .feature-title {
          font-family: var(--font-display);
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .feature-body {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--ink-soft);
          font-weight: 300;
        }

        /* ── TESTIMONIALS ── */
        .testimonials {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .testimonial {
          padding: 40px;
          border-right: 1px solid var(--rule);
        }
        .testimonial:last-child { border-right: none; }
        .quote {
          font-family: var(--font-display);
          font-size: 1rem;
          font-style: italic;
          line-height: 1.65;
          color: var(--ink);
          margin-bottom: 24px;
          font-weight: 400;
        }
        .quote-mark {
          font-size: 2rem;
          line-height: 0;
          vertical-align: -0.4em;
          color: var(--rule);
          font-family: Georgia, serif;
          margin-right: 2px;
        }
        .testimonial-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          background: var(--ink);
          color: var(--paper);
          font-family: var(--font-display);
          font-size: 0.875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .meta-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ink);
        }
        .meta-role {
          font-size: 0.75rem;
          color: var(--ink-muted);
          margin-top: 1px;
          font-family: var(--font-mono);
        }

        /* ── CTA ── */
        .cta-section {
          background: var(--ink);
          padding: 100px 32px;
          text-align: center;
        }
        .cta-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 500;
          color: #666660;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .cta-headline {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 900;
          color: var(--paper);
          line-height: 1.08;
          letter-spacing: -0.025em;
          max-width: 600px;
          margin: 0 auto 16px;
        }
        .cta-headline em { font-style: italic; color: #B8D4B8; }
        .cta-sub {
          font-size: 0.9375rem;
          color: #888882;
          margin-bottom: 44px;
          font-weight: 300;
        }
        .btn-cta {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ink);
          background: var(--paper);
          padding: 15px 40px;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: background 0.15s;
        }
        .btn-cta:hover { background: #EEEEE9; }
        .cta-note {
          font-size: 0.8rem;
          color: #555550;
          margin-top: 16px;
          font-family: var(--font-mono);
        }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid var(--rule);
          background: var(--paper);
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .footer-copy {
          font-size: 0.8125rem;
          color: var(--ink-muted);
          font-family: var(--font-mono);
        }
        .footer-links {
          display: flex;
          gap: 28px;
          list-style: none;
        }
        .footer-links a {
          font-size: 0.8125rem;
          color: var(--ink-muted);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-links a:hover { color: var(--ink); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; gap: 48px; padding: 64px 24px 56px; }
          .hero-headline { font-size: 2.5rem; }
          .steps { grid-template-columns: 1fr; }
          .step { border-right: none; border-bottom: 1px solid var(--rule); padding: 0 0 36px; margin-bottom: 36px; }
          .step:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .step + .step { padding-left: 0; }
          .features-grid { grid-template-columns: 1fr; }
          .feature { border-right: none; }
          .feature:nth-last-child(-n+2) { border-bottom: 1px solid var(--rule); }
          .feature:last-child { border-bottom: none; }
          .testimonials { grid-template-columns: 1fr; }
          .testimonial { border-right: none; border-bottom: 1px solid var(--rule); }
          .testimonial:last-child { border-bottom: none; }
          .stats-inner { grid-template-columns: 1fr; }
          .stat-item { border-right: none; border-bottom: 1px solid var(--rule); padding: 28px 0; }
          .stat-item:last-child { border-bottom: none; }
          .stat-item + .stat-item { padding-left: 0; }
          .nav-inner { padding: 0 20px; }
          .section { padding: 56px 24px; }
          .footer-inner { padding: 24px; flex-direction: column; align-items: flex-start; }
        }

        @media (max-width: 640px) {
          .nav-links li:not(:last-child):not(:nth-last-child(2)) { display: none; }
          .hero-actions { flex-direction: column; align-items: flex-start; }
          .cta-section { padding: 72px 24px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="wordmark">SmartBill</Link>
          <ul className="nav-links">
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#features">Features</a></li>
            <li><Link href="/login">Sign in</Link></li>
            <li>
              <Link href="/login" className="btn-nav">Get started</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid var(--rule)" }}>
        <div className="hero">
          <div>
            <p className="hero-eyebrow">Invoicing for independent professionals</p>
            <h1 className="hero-headline">
              Get paid faster.<br />
              Look <em>professional</em><br />
              doing it.
            </h1>
            <p className="hero-body">
              SmartBill turns your project notes into clean, client-ready invoices in under a minute. No templates to configure. No account manager to call. Just send and get paid.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn-primary">
                Create your first invoice
              </Link>
              <a href="#how-it-works" className="btn-ghost">
                See how it works →
              </a>
            </div>
          </div>

          {/* Invoice mockup */}
          <div className="hero-right">
            <div className="invoice-mockup">
              <div className="mockup-header">
                <div>
                  <div className="mockup-company">Meridian Studio</div>
                  <div className="mockup-email">hello@meridianstudio.co</div>
                </div>
                <div>
                  <div className="mockup-label">Invoice</div>
                  <div className="mockup-number">2025-047</div>
                </div>
              </div>
              <div>
                <div className="mockup-bill-to">Bill to</div>
                <div className="mockup-client">Kova Technologies Ltd.</div>
              </div>
              <div className="mockup-items">
                <div className="mockup-item-header">
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Rate</span>
                  <span>Total</span>
                </div>
                <div className="mockup-item-row">
                  <span>Brand identity design</span>
                  <span>1</span>
                  <span>$3,200</span>
                  <span>$3,200</span>
                </div>
                <div className="mockup-item-row">
                  <span>Revision rounds</span>
                  <span>3</span>
                  <span>$280</span>
                  <span>$840</span>
                </div>
                <div className="mockup-item-row">
                  <span>Brand guidelines doc</span>
                  <span>1</span>
                  <span>$600</span>
                  <span>$600</span>
                </div>
              </div>
              <div className="mockup-total">
                <span className="mockup-total-label">Total due</span>
                <span className="mockup-total-amount">$4,640</span>
              </div>
              <div>
                <span className="paid-stamp">
                  <span className="paid-dot" />
                  Payment received
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div className="stats-band">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-number">&lt; 60s</div>
            <div className="stat-label">Average time to send an invoice</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">Zero</div>
            <div className="stat-label">Templates to configure before you start</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">Free</div>
            <div className="stat-label">For solo freelancers, always</div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section">
        <div className="section-label">How it works</div>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <h3 className="step-title">Describe your work</h3>
            <p className="step-body">
              Fill in your client details and line items directly — no account setup, no onboarding wizard. If you have notes from a project, paste them and SmartBill parses the rest.
            </p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3 className="step-title">Review, then generate</h3>
            <p className="step-body">
              A live preview updates as you type — exactly what your client will see. When it looks right, hit Generate. Your invoice gets a permanent, shareable link instantly.
            </p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3 className="step-title">Client pays, you know immediately</h3>
            <p className="step-body">
              Share the link over email, WhatsApp, or anywhere. Your client reviews and pays securely. Your dashboard flips to Paid the moment it goes through — no refresh needed.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="section" style={{ paddingTop: 0 }}>
        <div className="section-label">What you get</div>
        <div
          className="features-grid"
          style={{ border: "1px solid var(--rule)" }}
        >
          {[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="feature-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ),
              title: "Live invoice preview",
              body: "What you see is what your client gets. The preview updates in real time as you fill in the form — no guessing, no surprises.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="feature-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              ),
              title: "Permanent invoice URLs",
              body: "Every invoice lives at its own link forever. Share it over email, message, or paste it into a project brief — it works anywhere.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="feature-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              ),
              title: "Real-time payment status",
              body: "The moment your client pays, your invoice updates. No polling, no refresh — it happens the instant the payment is confirmed.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="feature-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ),
              title: "Print-ready PDF",
              body: "One click. Your invoice exports as a clean, formatted PDF — your branding, line items, and totals all laid out correctly.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="feature-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              ),
              title: "Your branding on every invoice",
              body: "Your company name, email, and logo appear on every invoice you send. It looks like you built this yourself — because effectively, you did.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="feature-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ),
              title: "Direct payments to your account",
              body: "Connect your own Razorpay credentials. Client payments go directly to your account — SmartBill never touches the money.",
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="feature">
              {icon}
              <h3 className="feature-title">{title}</h3>
              <p className="feature-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-label">From the people using it</div>
        <div
          className="testimonials"
          style={{ border: "1px solid var(--rule)" }}
        >
          {[
            {
              quote: "I sent my first invoice two minutes after signing up. I didn't read a single help doc.",
              name: "Alex R.",
              role: "Freelance developer",
              initials: "AR",
            },
            {
              quote: "My clients actually comment on the invoice design. That has never happened to me before.",
              name: "Priya M.",
              role: "Independent consultant",
              initials: "PM",
            },
            {
              quote: "I paste my project notes in and it just knows what to do. The time I've saved is real.",
              name: "Tom W.",
              role: "Motion designer",
              initials: "TW",
            },
          ].map(({ quote, name, role, initials }) => (
            <div key={name} className="testimonial">
              <p className="quote">
                <span className="quote-mark">&ldquo;</span>
                {quote}&rdquo;
              </p>
              <div className="testimonial-meta">
                <div className="avatar">{initials}</div>
                <div>
                  <div className="meta-name">{name}</div>
                  <div className="meta-role">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <p className="cta-eyebrow">Get started today</p>
        <h2 className="cta-headline">
          Your next invoice is<br />
          <em>60 seconds away.</em>
        </h2>
        <p className="cta-sub">No credit card. No onboarding call. Just sign up and send.</p>
        <Link href="/login" className="btn-cta">
          Create a free account
        </Link>
        <p className="cta-note">Free forever for solo freelancers.</p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-copy">© 2025 SmartBill</span>
          <ul className="footer-links">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
}