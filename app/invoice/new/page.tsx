"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { createInvoice } from "@/app/actions/createInvoice";
import InvoicePreview from "@/components/InvoicePreview";
import LineItemRow from "@/components/LineItemRow";
import type { InvoiceFormState, LineItem, Profile } from "@/types";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --paper: #FAFAF7;
    --ink: #111110;
    --ink-soft: #5C5C58;
    --ink-muted: #A8A8A2;
    --rule: #E2E2DC;
    --accent: #2A5F2A;
    --accent-light: #EEF4EE;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', 'Courier New', monospace;
  }

  * { box-sizing: border-box; }

  .ni-layout {
    display: flex;
    flex-direction: row;
    height: 100vh;
    overflow: hidden;
    background: var(--paper);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    color: var(--ink);
  }

  /* ── LEFT PANEL ── */
  .ni-left {
    width: 48%;
    height: 100%;
    overflow-y: auto;
    background: #fff;
    border-right: 1px solid var(--rule);
    display: flex;
    flex-direction: column;
    position: relative;
    flex-shrink: 0;
  }

  /* Payout gate */
  .ni-gate {
    position: absolute;
    inset: 0;
    z-index: 10;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(4px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
  }
  .ni-gate-icon {
    width: 52px;
    height: 52px;
    background: #FEF3C7;
    border: 1px solid #FDE68A;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .ni-gate-title {
    font-family: var(--font-display);
    font-size: 1.375rem;
    font-weight: 900;
    color: var(--ink);
    margin-bottom: 10px;
    letter-spacing: -0.02em;
  }
  .ni-gate-body {
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--ink-soft);
    font-weight: 300;
    line-height: 1.65;
    max-width: 280px;
    margin-bottom: 28px;
  }
  .ni-gate-btn {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    padding: 12px 28px;
    background: var(--ink);
    color: var(--paper);
    border: none;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: background 0.15s;
  }
  .ni-gate-btn:hover { background: #2A2A28; }

  /* Top bar */
  .ni-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 60px;
    border-bottom: 1px solid var(--rule);
    flex-shrink: 0;
  }
  .ni-back {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--ink-muted);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.15s;
  }
  .ni-back:hover { color: var(--ink); }
  .ni-heading {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  /* Form body */
  .ni-form {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0 32px 32px;
    flex: 1;
  }

  /* Section */
  .ni-section {
    padding: 28px 0;
    border-bottom: 1px solid var(--rule);
  }
  .ni-section:last-child { border-bottom: none; }
  .ni-section-label {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    color: var(--ink-muted);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  /* Inputs */
  .ni-field {
    margin-bottom: 12px;
  }
  .ni-field:last-child { margin-bottom: 0; }
  .ni-label {
    display: block;
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--ink-soft);
    margin-bottom: 6px;
  }
  .ni-input {
    width: 100%;
    border: 1px solid var(--rule);
    background: var(--paper);
    padding: 10px 14px;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--ink);
    outline: none;
    transition: border-color 0.15s;
    -webkit-font-smoothing: antialiased;
  }
  .ni-input::placeholder { color: var(--ink-muted); }
  .ni-input:focus { border-color: var(--ink); }

  /* Line items */
  .ni-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ni-add-item {
    margin-top: 10px;
    width: 100%;
    padding: 10px;
    border: 1px dashed var(--rule);
    background: transparent;
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--ink-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: border-color 0.15s, color 0.15s;
    letter-spacing: 0.01em;
  }
  .ni-add-item:hover { border-color: var(--ink-soft); color: var(--ink-soft); }

  /* Total & Generate */
  .ni-footer {
    padding: 28px 0 0;
  }
  .ni-total-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--ink);
    margin-bottom: 20px;
  }
  .ni-total-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .ni-total-amount {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 900;
    color: var(--ink);
    letter-spacing: -0.03em;
  }
  .ni-error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-left: 3px solid #EF4444;
    padding: 10px 14px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: #991b1b;
    margin-bottom: 16px;
    letter-spacing: 0.01em;
  }
  .ni-generate {
    width: 100%;
    padding: 14px;
    background: var(--ink);
    color: var(--paper);
    border: none;
    font-family: var(--font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    transition: background 0.15s;
  }
  .ni-generate:hover:not(:disabled) { background: #2A2A28; }
  .ni-generate:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── RIGHT PANEL ── */
  .ni-right {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    background: var(--paper);
    padding: 40px 40px;
  }
  .ni-preview-label {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ni-preview-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--rule);
  }

  /* Spinner */
  .ni-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ni-spin 0.65s linear infinite;
    flex-shrink: 0;
  }
  @keyframes ni-spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .ni-layout { flex-direction: column; height: auto; overflow: auto; }
    .ni-left { width: 100%; height: auto; overflow: visible; }
    .ni-right { padding: 24px 16px 48px; }
    .ni-topbar { padding: 0 16px; }
    .ni-form { padding: 0 16px 24px; }
  }
`;

export default function NewInvoicePage() {
  const router = useRouter();

  const [invoiceData, setInvoiceData] = useState<InvoiceFormState>({
    clientName: "",
    clientEmail: "",
    items: [{ description: "", quantity: 1, rate: 0 }],
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payoutBlocked = profile !== null && profile.payout_configured === false;

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileRow) setProfile(profileRow as Profile);
    }
    init();
  }, [router]);

  function handleItemChange(index: number, updated: LineItem) {
    setInvoiceData((prev) => {
      const items = [...prev.items];
      items[index] = updated;
      return { ...prev, items };
    });
  }

  function handleItemRemove(index: number) {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function handleAddItem() {
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, rate: 0 }],
    }));
  }

  const total = invoiceData.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  async function handleGenerate() {
    setError(null);

    if (!invoiceData.clientName.trim() || !invoiceData.clientEmail.trim()) {
      setError("Client name and email are required.");
      return;
    }

    const hasItem = invoiceData.items.some((i) => i.description.trim() !== "");
    if (!hasItem) {
      setError("At least one line item must have a description.");
      return;
    }

    setLoading(true);

    const result = await createInvoice({
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      items: invoiceData.items,
    });

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push(`/invoice/${result.sharingToken}`);
  }

  return (
    <div className="ni-layout">
      <style>{pageStyles}</style>

      {/* ── LEFT PANEL ── */}
      <div className="ni-left">

        {/* Payout gate */}
        {payoutBlocked && (
          <div className="ni-gate">
            <div className="ni-gate-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ni-gate-title">Set Up Payout First</div>
            <p className="ni-gate-body">
              Before you can generate invoices, add your Razorpay credentials so clients can pay you directly.
            </p>
            <button
              className="ni-gate-btn"
              onClick={() => router.push("/dashboard?openPayout=1")}
            >
              Configure Payout Settings →
            </button>
          </div>
        )}

        {/* Top bar */}
        <div className="ni-topbar">
          <Link href="/dashboard" className="ni-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <span className="ni-heading">New Invoice</span>
        </div>

        {/* Form */}
        <div className="ni-form">

          {/* Client Details */}
          <div className="ni-section">
            <div className="ni-section-label">Client Details</div>
            <div className="ni-field">
              <label htmlFor="clientName" className="ni-label">Client Name</label>
              <input
                id="clientName"
                type="text"
                value={invoiceData.clientName}
                onChange={(e) => setInvoiceData((prev) => ({ ...prev, clientName: e.target.value }))}
                placeholder="Acme Inc."
                className="ni-input"
              />
            </div>
            <div className="ni-field">
              <label htmlFor="clientEmail" className="ni-label">Client Email</label>
              <input
                id="clientEmail"
                type="email"
                value={invoiceData.clientEmail}
                onChange={(e) => setInvoiceData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="billing@client.com"
                className="ni-input"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="ni-section">
            <div className="ni-section-label">Line Items</div>
            <div className="ni-items">
              {invoiceData.items.map((item, index) => (
                <LineItemRow
                  key={index}
                  item={item}
                  index={index}
                  onChange={handleItemChange}
                  onRemove={handleItemRemove}
                />
              ))}
            </div>
            <button onClick={handleAddItem} className="ni-add-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Line Item
            </button>
          </div>

          {/* Total & Generate */}
          <div className="ni-footer">
            <div className="ni-total-row">
              <span className="ni-total-label">Total</span>
              <span className="ni-total-amount">
                {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </span>
            </div>

            {error && <div className="ni-error">{error}</div>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="ni-generate"
            >
              {loading && <span className="ni-spinner" />}
              {loading ? "Generating…" : "Generate Invoice"}
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Live Preview ── */}
      <div className="ni-right">
        <div className="ni-preview-label">Live Preview</div>
        <div style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.09)" }}>
          <InvoicePreview invoiceData={invoiceData} profile={profile} />
        </div>
      </div>
    </div>
  );
}