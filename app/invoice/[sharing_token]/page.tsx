// NOTE: Delete app/invoice/[invoice_number]/ directory
// after creating this file. The [sharing_token] folder replaces it entirely.

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const sharingToken =
    typeof params.sharing_token === "string" ? params.sharing_token : "";

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
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

  // Initial fetch
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

  // Real-time subscriptions
  useEffect(() => {
    if (!invoice) return;

    const invoiceChannel = supabase
      .channel(`invoice-${sharingToken}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "invoices",
          filter: `public_sharing_token=eq.${sharingToken}`,
        },
        (payload) => {
          setInvoice(payload.new as InvoiceData);
        }
      )
      .subscribe();

    const itemsChannel = supabase
      .channel(`items-${sharingToken}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoice_items",
          filter: `invoice_id=eq.${invoice.id}`,
        },
        () => {
          fetchItems(invoice.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invoiceChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [invoice, sharingToken, fetchItems]);

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
        name: profile?.company_name ?? "InvoiceFlow",
        description: `Invoice ${invoice.invoice_number}`,
        order_id: orderResult.orderId,
        handler: () => {
          // Webhook handles DB update; real-time subscription updates UI
          setPaying(false);
        },
        prefill: { email: invoice.client_email },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-black" />
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-10 max-w-sm w-full text-center">
          <p className="text-slate-700 font-medium mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-black underline underline-offset-4 hover:text-slate-600 transition"
          >
            ← Back to Dashboard
          </Link>
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
    <div className="min-h-screen bg-neutral-100">

      {/* TOP BAR */}
      <header className="print:hidden sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <span className="text-lg font-black text-black tracking-tight shrink-0 cursor-pointer" onClick={() => router.push('/dashboard')}>
            InvoiceFlow
          </span>

          <span className="font-mono text-sm text-slate-400 truncate">
            {invoice.invoice_number}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
            >
              Print / Download PDF
            </button>

            {!isPaid && !showConfirm && (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={paying}
                className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {paying ? "Processing…" : "Pay Invoice"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* STATUS TIMELINE */}
      <div className="print:hidden max-w-5xl mx-auto px-4 pt-6 pb-2">
        <AnimatePresence mode="wait">
          {isPaid ? (
            <motion.div
              key="paid-bar"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="bg-black text-white rounded-xl px-6 py-4 text-sm font-medium mb-4"
            >
              ✅ Payment confirmed. Thank you — a receipt has been sent to{" "}
              <span className="font-mono">{invoice.client_email}</span>.
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="bg-white border border-neutral-200 rounded-xl px-6 py-5">
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 bg-slate-200 z-0" />
            <TimelineStep
              label="Invoice Created"
              sublabel={formatDate(invoice.created_at)}
              complete
              color="indigo"
            />
            <TimelineStep
              label="Sent to Client"
              sublabel={formatDate(invoice.created_at)}
              complete
              color="indigo"
            />
            <TimelineStep
              label="Payment Received"
              sublabel={isPaid ? "Paid" : "Awaiting payment"}
              complete={isPaid}
              color="green"
              animate
            />
          </div>
        </div>

        {error && invoice && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* INVOICE PREVIEW */}
      <div className="max-w-3xl mx-auto py-8 px-4 print:shadow-none print:py-0">
        <InvoicePreview
          invoiceData={invoiceFormData}
          profile={profile}
          invoiceNumber={invoice.invoice_number}
        />
      </div>

      {/* CONFIRM PAYMENT MODAL */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md pointer-events-auto">
                <h2 className="text-xl font-black text-slate-900 mb-1">
                  Confirm Payment
                </h2>
                <p className="text-sm text-slate-400 font-mono mb-6">
                  {invoice.invoice_number}
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
                  <span className="text-sm text-slate-500 font-medium">
                    Amount due
                  </span>
                  <span className="text-2xl font-black text-black">
                    {formatUSD(total)}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-8">
                  By clicking Confirm, you authorize payment of{" "}
                  <span className="font-semibold text-black">
                    {formatUSD(total)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-black">
                    {profile?.company_name || "the invoice issuer"}
                  </span>
                  . You will be redirected to complete payment securely.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirm(false);
                      handlePayInvoice();
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold text-sm rounded-lg py-2.5 transition-colors"
                  >
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

interface TimelineStepProps {
  label: string;
  sublabel: string;
  complete: boolean;
  color: "indigo" | "green";
  animate?: boolean;
}

function TimelineStep({
  label,
  sublabel,
  complete,
  color,
  animate: shouldAnimate = false,
}: TimelineStepProps) {
  const filledClass =
    color === "green"
      ? "bg-green-500 border-green-500"
      : "bg-indigo-500 border-indigo-500";
  const emptyClass = "bg-white border-slate-300";
  const dotBase =
    "relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto transition-colors duration-500";

  const checkmark = (
    <svg
      className="w-4 h-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center gap-2 w-1/3 text-center">
      {shouldAnimate ? (
        <motion.div
          className={`${dotBase} ${complete ? filledClass : emptyClass}`}
          animate={{
            scale: complete ? [1, 1.2, 1] : 1,
            backgroundColor: complete
              ? color === "green"
                ? "#22c55e"
                : "#6366f1"
              : "#ffffff",
          }}
          transition={{ duration: 0.4 }}
        >
          {complete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.25 }}
            >
              {checkmark}
            </motion.span>
          )}
        </motion.div>
      ) : (
        <div className={`${dotBase} ${complete ? filledClass : emptyClass}`}>
          {complete && checkmark}
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}