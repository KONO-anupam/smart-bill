'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { parseInvoiceText } from '@/lib/parseInvoiceText';
import { createInvoice } from '@/app/actions/createInvoice';
import InvoicePreview from '@/components/InvoicePreview';
import LineItemRow from '@/components/LineItemRow';
import type { InvoiceFormState, LineItem, Profile } from '@/types';

export default function NewInvoicePage() {
  const router = useRouter();

  const [invoiceData, setInvoiceData] = useState<InvoiceFormState>({
    clientName: '',
    clientEmail: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
  });
  const [rawText, setRawText] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileRow) setProfile(profileRow as Profile);
    }

    init();
  }, [router]);

  function handleImport() {
    const parsed = parseInvoiceText(rawText);
    setInvoiceData((prev) => ({
      clientName: parsed.clientName ?? prev.clientName,
      clientEmail: parsed.clientEmail ?? prev.clientEmail,
      items: parsed.items.length > 0 ? parsed.items : prev.items,
    }));
    setRawText('');
  }

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
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }],
    }));
  }

  const total = invoiceData.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  async function handleGenerate() {
    setError(null);

    if (!invoiceData.clientName.trim() || !invoiceData.clientEmail.trim()) {
      setError('Client name and email are required.');
      return;
    }

    const hasItem = invoiceData.items.some(
      (i) => i.description.trim() !== ''
    );
    if (!hasItem) {
      setError('At least one line item must have a description.');
      return;
    }

    setLoading(true);

    const result = await createInvoice({
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      items: invoiceData.items,
    });

    setLoading(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    router.push(`/invoice/${result.sharingToken}`);
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">

      {/* ── LEFT PANEL ── */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto bg-white border-r border-slate-200">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <span className="text-sm font-semibold text-slate-700">New Invoice</span>
        </div>

        <div className="flex flex-col gap-8 px-8 py-6">

          {/* Smart Import */}
          <section>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Smart Import
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw text e.g. 'John Doe, john@email.com, 5 hours of consulting at $100 an hour'"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
            <button
              onClick={handleImport}
              className="mt-2 px-4 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              Import
            </button>
          </section>

          {/* Client Details */}
          <section>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Client Details
            </label>
            <div className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor="clientName"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Client Name
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={invoiceData.clientName}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      clientName: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label
                  htmlFor="clientEmail"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Client Email
                </label>
                <input
                  id="clientEmail"
                  type="email"
                  value={invoiceData.clientEmail}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      clientEmail: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Line Items
            </label>
            <div className="flex flex-col gap-2">
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
            <button
              onClick={handleAddItem}
              className="mt-3 w-full border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 text-sm py-2 rounded-md transition-colors"
            >
              + Add Line Item
            </button>
          </section>

          {/* Total & Generate */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Total</span>
              <span className="text-lg font-black text-slate-900">
                {total.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </span>
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-3">{error}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-3 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Spinner />}
              Generate &amp; View Invoice
            </button>
          </section>
        </div>
      </div>

      {/* ── RIGHT PANEL — Live Preview ── */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto bg-slate-50 px-6 py-8">
        <InvoicePreview
          invoiceData={invoiceData}
          profile={profile}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}