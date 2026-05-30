// components/InvoicePreview
"use client";

import type { InvoiceFormState, Profile } from "@/types";
import Image from "next/image";

interface InvoicePreviewProps {
  invoiceData: InvoiceFormState;
  profile: Profile | null;
  invoiceNumber?: string;
}

function formatDate(date: Date): string {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function InvoicePreview({
  invoiceData,
  profile,
  invoiceNumber,
}: InvoicePreviewProps) {
  const today = formatDate(new Date());

  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  const validItems = invoiceData.items.filter(
    (item) => item.description.trim() !== ""
  );

  return (
    <div className="print:block bg-white rounded-xl max-w-2xl mx-auto font-sans text-black p-10 border border-slate-100">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-3">
          {profile?.company_logo_url && (
            <Image
              src={profile.company_logo_url}
              alt={`${profile.company_name ?? "Company"} logo`}
              width={48}
              height={48}
              className="max-h-12 w-auto object-contain"
            />
          )}
          <div>
            {profile?.company_name ? (
              <p className="text-2xl font-black text-black leading-tight tracking-tight">
                {profile.company_name}
              </p>
            ) : (
              <p className="text-xl italic text-slate-300 font-normal">
                Your Company
              </p>
            )}
            {profile?.company_email && (
              <p className="text-sm text-slate-400 mt-0.5">
                {profile.company_email}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-4xl font-black uppercase tracking-[0.15em] text-black">
            Invoice
          </p>
          {invoiceNumber ? (
            <p className="text-sm font-mono text-slate-500 mt-1.5">
              {invoiceNumber}
            </p>
          ) : (
            <p className="text-sm font-mono text-slate-300 mt-1.5 italic">
              PREVIEW
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">{today}</p>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="h-px w-full bg-slate-100 mb-8" />

      {/* ── BILL TO ── */}
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
          Bill To
        </p>
        {invoiceData.clientName ? (
          <p className="text-xl font-bold text-black leading-tight">
            {invoiceData.clientName}
          </p>
        ) : (
          <p className="text-base italic text-slate-300">Client name</p>
        )}
        {invoiceData.clientEmail ? (
          <p className="text-sm text-slate-400 mt-0.5">
            {invoiceData.clientEmail}
          </p>
        ) : (
          <p className="text-sm italic text-slate-300 mt-0.5">
            client@email.com
          </p>
        )}
      </div>

      {/* ── LINE ITEMS TABLE ── */}
      <div className="mb-8 overflow-hidden rounded-lg border border-slate-200">
        <div className="grid grid-cols-12 bg-black text-white text-[10px] font-bold uppercase tracking-[0.12em] px-4 py-3">
          <span className="col-span-6">Description</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Rate</span>
          <span className="col-span-2 text-right">Total</span>
        </div>

        {validItems.length > 0 ? (
          validItems.map((item, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 px-4 py-3.5 text-sm border-b border-slate-100 last:border-b-0 ${
                index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
              }`}
            >
              <span className="col-span-6 text-slate-800">{item.description}</span>
              <span className="col-span-2 text-center text-slate-500">
                {item.quantity}
              </span>
              <span className="col-span-2 text-right text-slate-500">
                {formatCurrency(item.rate)}
              </span>
              <span className="col-span-2 text-right font-semibold text-slate-900">
                {formatCurrency(item.quantity * item.rate)}
              </span>
            </div>
          ))
        ) : (
          <div className="px-4 py-7 text-center text-sm italic text-slate-300 bg-white">
            No items added yet
          </div>
        )}
      </div>

      {/* ── TOTALS ── */}
      <div className="flex justify-end mb-10">
        <div className="w-64 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Tax (0%)</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3 border-t-2 border-black mt-1">
            <span className="text-sm font-bold text-black uppercase tracking-wider">
              Total Due
            </span>
            <span className="text-2xl font-black text-black">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="border-t border-slate-100 pt-6 text-center">
        <p className="text-xs italic text-slate-400">
          Thank you for your business.
        </p>
      </div>
    </div>
  );
}