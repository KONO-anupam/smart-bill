"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import InvoicePreview from "@/components/InvoicePreview";
import { createRazorpayOrder } from "@/app/actions/createRazorpayOrder";
import type { InvoiceData, Profile, InvoiceFormState, LineItem } from "@/types";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open(): void;
      on(event: string, handler: () => void): void;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: { email: string };
  theme: { color: string };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

function formatUSD(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function invoiceTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
}

interface InvoicePageClientProps {
  sharingToken: string;
  isOwner: boolean;
}

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
    --accent-text: #1E461E;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', 'Courier New', monospace;
  }

  .inv-page {
    min-height: 100vh;
    background: var(--paper);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    color: var(--ink);
  }

  /* ── TOP BAR ── */
  .inv-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--paper);
    border-bottom: 1px solid var(--rule);
  }
  .inv-topbar-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 32px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .inv-wordmark {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--ink);
    text-decoration: none;
    letter-spacing: -0.02em;
    flex-shrink: 0;
    transition: color 0.15s;
  }
  .inv-wordmark:hover { color: var(--ink-soft); }
  .inv-number {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--ink-muted);
    letter-spacing: 0.06em;
  }
  .inv-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* Buttons matching landing page */
  .inv-btn {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 8px 18px;
    border: 1px solid var(--rule);
    background: transparent;
    color: var(--ink-soft);
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    letter-spacing: 0.01em;
  }
  .inv-btn:hover {
    background: var(--rule);
    color: var(--ink);
  }
  .inv-btn-pay {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 8px 18px;
    background: var(--accent);
    color: #fff;
    border: 1px solid var(--accent);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: background 0.15s;
    letter-spacing: 0.01em;
  }
  .inv-btn-pay:hover { background: #1E461E; }
  .inv-btn-pay:disabled { opacity: 0.55; cursor: not-allowed; }

  /* ── STATUS BAND ── */
  .inv-status-band {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px 32px 0;
  }

  /* Paid confirmation bar */
  .inv-paid-bar {
    background: var(--ink);
    color: var(--paper);
    padding: 14px 20px;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    border: 1px solid var(--ink);
  }
  .inv-paid-bar em {
    font-family: var(--font-mono);
    font-style: normal;
    font-size: 0.8125rem;
  }

  /* Timeline */
  .inv-timeline {
    background: #fff;
    border: 1px solid var(--rule);
    padding: 28px 32px;
  }
  .inv-timeline-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    position: relative;
  }
  .inv-timeline-rule {
    position: absolute;
    top: 18px;
    left: calc(50% - 60px);
    right: calc(50% - 60px);
    height: 1px;
    background: var(--rule);
  }
  .inv-timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
  }
  .inv-step-dot {
    width: 36px;
    height: 36px;
    border: 2px solid var(--rule);
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    transition: border-color 0.4s, background 0.4s;
  }
  .inv-step-dot.complete-indigo {
    background: #4F46E5;
    border-color: #4F46E5;
  }
  .inv-step-dot.complete-green {
    background: var(--accent);
    border-color: var(--accent);
  }
  .inv-step-label {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--ink);
  }
  .inv-step-sub {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--ink-muted);
    margin-top: -4px;
    letter-spacing: 0.04em;
  }

  /* Error */
  .inv-error {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: #b91c1c;
    margin-top: 10px;
    letter-spacing: 0.02em;
  }

  /* ── INVOICE BODY ── */
  .inv-body {
    max-width: 780px;
    margin: 0 auto;
    padding: 40px 32px 64px;
  }

  /* ── MODAL ── */
  .inv-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(17,17,16,0.7);
  }
  .inv-modal-wrap {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    pointer-events: none;
  }
  .inv-modal {
    background: var(--paper);
    border: 1px solid var(--rule);
    padding: 36px;
    width: 100%;
    max-width: 440px;
    pointer-events: auto;
    box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  }
  .inv-modal-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .inv-modal-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 900;
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .inv-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }
  .inv-modal-close:hover { color: var(--ink); }
  .inv-modal-ref {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--ink-muted);
    letter-spacing: 0.06em;
    margin-bottom: 24px;
  }
  .inv-modal-amount-box {
    background: #fff;
    border: 1px solid var(--rule);
    border-top: 2px solid var(--ink);
    padding: 16px 20px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .inv-modal-amount-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .inv-modal-amount {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 900;
    color: var(--ink);
    letter-spacing: -0.03em;
  }
  .inv-modal-note {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--ink-soft);
    line-height: 1.65;
    font-weight: 300;
    margin-bottom: 28px;
  }
  .inv-modal-note strong {
    font-weight: 600;
    color: var(--ink);
  }
  .inv-modal-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .inv-modal-cancel {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    padding: 12px;
    border: 1px solid var(--rule);
    background: transparent;
    color: var(--ink-soft);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    letter-spacing: 0.01em;
  }
  .inv-modal-cancel:hover { background: var(--rule); color: var(--ink); }
  .inv-modal-confirm {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    padding: 12px;
    background: var(--accent);
    color: #fff;
    border: 1px solid var(--accent);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: background 0.15s;
    letter-spacing: 0.01em;
  }
  .inv-modal-confirm:hover { background: #1E461E; }

  /* Loading */
  .inv-loader {
    min-height: 100vh;
    background: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .inv-spinner {
    width: 28px;
    height: 28px;
    border: 2px solid var(--rule);
    border-top-color: var(--ink);
    border-radius: 50%;
    animation: inv-spin 0.7s linear infinite;
  }
  @keyframes inv-spin { to { transform: rotate(360deg); } }

  /* Not found */
  .inv-notfound {
    min-height: 100vh;
    background: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .inv-notfound-card {
    background: #fff;
    border: 1px solid var(--rule);
    border-top: 3px solid var(--ink);
    padding: 48px 40px;
    max-width: 360px;
    width: 100%;
    text-align: center;
  }
  .inv-notfound-title {
    font-family: var(--font-display);
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }
  .inv-notfound-sub {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--ink-muted);
    margin-bottom: 28px;
    letter-spacing: 0.02em;
  }
  .inv-notfound-back {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--ink);
    text-decoration: none;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 2px;
    transition: border-color 0.15s;
  }
  .inv-notfound-back:hover { border-color: var(--ink); }

  /* Copied indicator */
  .inv-copied {
    color: var(--accent) !important;
  }

  /* Print */
  @media print {
    .inv-topbar,
    .inv-status-band { display: none; }
    .inv-page { background: white; }
  }

  @media (max-width: 640px) {
    .inv-topbar-inner { padding: 0 16px; }
    .inv-status-band { padding: 16px 16px 0; }
    .inv-body { padding: 24px 16px 48px; }
    .inv-timeline { padding: 20px 16px; }
  }
`;

export default function InvoicePageClient({ sharingToken, isOwner }: InvoicePageClientProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (invoice) {
      document.title = `Invoice from ${profile?.company_name ?? "SmartBill"} | SmartBill`;
    }
  }, [invoice, profile]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const fetchItems = useCallback(async (invoiceId: string) => {
    const { data: itemRows } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: true });

    if (itemRows && itemRows.length > 0) {
      setLineItems(
        itemRows.map((row) => ({
          description: row.description as string,
          quantity: row.quantity as number,
          rate: (row.rate as number) / 100,
        }))
      );
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data: invoiceRow, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("public_sharing_token", sharingToken)
        .single();

      if (invoiceError || !invoiceRow) {
        setError("Invoice not found.");
        setLoading(false);
        return;
      }

      const typedInvoice = invoiceRow as InvoiceData;
      setInvoice(typedInvoice);

      const { data: itemRows } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", typedInvoice.id)
        .order("created_at", { ascending: true });

      if (itemRows && itemRows.length > 0) {
        setLineItems(
          itemRows.map((row) => ({
            description: row.description as string,
            quantity: row.quantity as number,
            rate: (row.rate as number) / 100,
          }))
        );
      } else {
        setLineItems(typedInvoice.items ?? []);
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", typedInvoice.user_id)
        .single();

      if (profileRow) setProfile(profileRow as Profile);
      setLoading(false);
    }

    if (sharingToken) fetchData();
  }, [sharingToken]);

  useEffect(() => {
    if (!invoice) return;

    const invoiceChannel = supabase
      .channel(`invoice-${sharingToken}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "invoices",
        filter: `public_sharing_token=eq.${sharingToken}`,
      }, (payload) => {
        setInvoice(payload.new as InvoiceData);
      })
      .subscribe();

    const itemsChannel = supabase
      .channel(`items-${sharingToken}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "invoice_items",
        filter: `invoice_id=eq.${invoice.id}`,
      }, () => {
        fetchItems(invoice.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(invoiceChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [invoice, sharingToken, fetchItems]);

  function handleCopyPublicLink() {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  async function handlePayInvoice() {
    if (!invoice) return;
    setPaying(true);
    setError(null);

    try {
      const amountInPaise = Math.round(invoiceTotal(lineItems) * 100);

      const orderResult = await createRazorpayOrder({
        sharingToken: invoice.public_sharing_token,
        amountInPaise,
        currency: "INR",
        invoiceNumber: invoice.invoice_number,
      });

      if ("error" in orderResult) {
        setError(orderResult.error);
        setPaying(false);
        return;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amountInPaise,
        currency: "INR",
        name: profile?.company_name ?? "SmartBill",
        description: `Invoice ${invoice.invoice_number}`,
        order_id: orderResult.orderId,
        handler: () => { setPaying(false); },
        prefill: { email: invoice.client_email },
        theme: { color: "#2A5F2A" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="inv-loader">
        <style>{pageStyles}</style>
        <div className="inv-spinner" />
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="inv-notfound">
        <style>{pageStyles}</style>
        <div className="inv-notfound-card">
          <div className="inv-notfound-title">Invoice not found</div>
          <div className="inv-notfound-sub">{error}</div>
          <Link href="/dashboard" className="inv-notfound-back">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const isPaid = invoice.status === "Paid";
  const total = invoiceTotal(lineItems);

  const invoiceFormData: InvoiceFormState = {
    clientName: invoice.client_name,
    clientEmail: invoice.client_email,
    items: lineItems,
  };

  return (
    <div className="inv-page">
      <style>{pageStyles}</style>

      {/* TOP BAR */}
      <header className="inv-topbar">
        <div className="inv-topbar-inner">
          <Link href="/dashboard" className="inv-wordmark">SmartBill</Link>
          <span className="inv-number">{invoice.invoice_number}</span>
          <div className="inv-actions">
            <button onClick={() => window.print()} className="inv-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / PDF
            </button>

            {isOwner ? (
              <button onClick={handleCopyPublicLink} className={`inv-btn${linkCopied ? " inv-copied" : ""}`}>
                {linkCopied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            ) : (
              !isPaid && !showConfirm && (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={paying}
                  className="inv-btn-pay"
                >
                  <LockIcon />
                  {paying ? "Processing…" : "Pay Invoice"}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* STATUS TIMELINE */}
      <div className="inv-status-band">
        <AnimatePresence mode="wait">
          {isPaid && (
            <motion.div
              key="paid-bar"
              className="inv-paid-bar"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Payment confirmed. Thank you — a receipt has been sent to{" "}
              <em>{invoice.client_email}</em>.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="inv-timeline">
          <div className="inv-timeline-inner">
            <div className="inv-timeline-rule" />

            {/* Step 1 */}
            <div className="inv-timeline-step">
              <div className="inv-step-dot complete-indigo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="inv-step-label">Invoice Created</div>
                <div className="inv-step-sub">{formatDate(invoice.created_at)}</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="inv-timeline-step">
              <motion.div
                className={`inv-step-dot${isPaid ? " complete-green" : ""}`}
                animate={{
                  scale: isPaid ? [1, 1.15, 1] : 1,
                }}
                transition={{ duration: 0.35 }}
              >
                {isPaid && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12, duration: 0.2 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.span>
                )}
              </motion.div>
              <div>
                <div className="inv-step-label">Payment Received</div>
                <div className="inv-step-sub">{isPaid ? "Paid" : "Awaiting payment"}</div>
              </div>
            </div>
          </div>
        </div>

        {error && invoice && (
          <p className="inv-error">{error}</p>
        )}
      </div>

      {/* INVOICE PREVIEW */}
      <div className="inv-body">
        <div style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>
          <InvoicePreview
            invoiceData={invoiceFormData}
            profile={profile}
            invoiceNumber={invoice.invoice_number}
          />
        </div>
      </div>

      {/* CONFIRM PAYMENT MODAL */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              key="overlay"
              className="inv-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              key="modal-wrap"
              className="inv-modal-wrap"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="inv-modal">
                <div className="inv-modal-head">
                  <h2 className="inv-modal-title">Confirm Payment</h2>
                  <button className="inv-modal-close" onClick={() => setShowConfirm(false)}>×</button>
                </div>
                <p className="inv-modal-ref">{invoice.invoice_number}</p>

                <div className="inv-modal-amount-box">
                  <span className="inv-modal-amount-label">Amount due</span>
                  <span className="inv-modal-amount">{formatUSD(total)}</span>
                </div>

                <p className="inv-modal-note">
                  By clicking Confirm, you authorize payment of{" "}
                  <strong>{formatUSD(total)}</strong> to{" "}
                  <strong>{profile?.company_name || "the invoice issuer"}</strong>.
                  You will be redirected to complete payment securely.
                </p>

                <div className="inv-modal-btns">
                  <button className="inv-modal-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button
                    className="inv-modal-confirm"
                    onClick={() => { setShowConfirm(false); handlePayInvoice(); }}
                  >
                    <LockIcon />
                    Confirm &amp; Pay
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}