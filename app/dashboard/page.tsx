
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { InvoiceData, LineItem, Profile } from '@/types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
}

function invoiceAmount(invoice: InvoiceData): number {
  return invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
}

function formatUSD(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function DashboardPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Profile edit panel state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      currentUserIdRef.current = user.id;

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileRow) setProfile(profileRow as Profile);

      const { data: invoiceRows } = await supabase
        .from('invoices')
        .select('*, public_sharing_token')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invoiceRows) setInvoices(invoiceRows as InvoiceData[]);

      setLoading(false);
    }

    init();
  }, [router]);

  // Real-time subscription
  useEffect(() => {
    if (loading) return;
    const userId = currentUserIdRef.current;
    if (!userId) return;

    const channel = supabase
      .channel('dashboard-invoices')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setInvoices((prev) => [payload.new as InvoiceData, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === (payload.new as InvoiceData).id
                ? (payload.new as InvoiceData)
                : inv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function openProfilePanel() {
    setEditName(profile?.company_name ?? '');
    setEditEmail(profile?.company_email ?? '');
    setEditLogo(profile?.company_logo_url ?? '');
    setProfilePanelOpen(true);
    setDropdownOpen(false);
  }

  async function handleSaveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        company_name: editName,
        company_email: editEmail,
        company_logo_url: editLogo || null,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    setSavingProfile(false);

    if (!error && data) {
      setProfile(data as Profile);
      setProfilePanelOpen(false);
    }
  }

  async function handleCopyLink(inv: InvoiceData) {
    await navigator.clipboard.writeText(
      `${window.location.origin}/invoice/${inv.public_sharing_token}`
    );
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const profileIncomplete =
    profile !== null &&
    (profile.company_name.trim() === '' || profile.company_email.trim() === '');

  const filtered = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      inv.client_name.toLowerCase().includes(q) ||
      inv.invoice_number.toLowerCase().includes(q)
    );
  });

  const totalPendingValue = invoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((sum, inv) => sum + invoiceAmount(inv), 0);

  const totalPaidValue = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + invoiceAmount(inv), 0);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── TOP NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="cursor-pointer" onClick={() => router.push('/dashboard')}>
            <p className="text-base font-black text-slate-900 leading-tight">
              InvoiceFlow
            </p>
            {loading ? (
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xs text-slate-400 leading-tight">
                {profile?.company_name || 'Your workspace'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/invoice/new')}
              className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              New Invoice
            </button>

            {/* Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="h-9 w-9 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                {getInitial(profile?.company_name ?? '')}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-40">
                  <button
                    onClick={openProfilePanel}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── PROFILE INCOMPLETE BANNER ── */}
      {!loading && profileIncomplete && !bannerDismissed && (
        <div className="fixed top-14 left-0 right-0 z-20 bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            Your profile is incomplete. Invoices won&apos;t show your company details
            until you fill it in.{' '}
            <button
              onClick={openProfilePanel}
              className="font-semibold underline underline-offset-2 hover:text-amber-900"
            >
              Complete Profile
            </button>
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-amber-500 hover:text-amber-700 text-lg leading-none ml-4"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {(!loading && profileIncomplete && !bannerDismissed) && (
          <div className="h-10" />
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
          <StatCard
            label="Total Invoices"
            value={String(invoices.length)}
            sub=""
            loading={loading}
          />
          <StatCard
            label="Pending"
            value={String(invoices.filter((i) => i.status === 'Pending').length)}
            sub={`${formatUSD(totalPendingValue)} total value`}
            loading={loading}
          />
          <StatCard
            label="Paid"
            value={String(invoices.filter((i) => i.status === 'Paid').length)}
            sub={`${formatUSD(totalPaidValue)} collected`}
            loading={loading}
          />
        </div>

        {/* Invoice table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              Your Invoices
            </h2>
            <input
              type="text"
              placeholder="Search by client or invoice #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {loading ? (
            <SkeletonRows />
          ) : invoices.length === 0 ? (
            <EmptyState onNew={() => router.push('/invoice/new')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Invoice #</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-slate-700 text-xs">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {inv.client_name}
                        <span className="block text-xs text-slate-400 font-normal">
                          {inv.client_email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(inv.created_at)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {formatUSD(invoiceAmount(inv))}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/invoice/${inv.public_sharing_token}`
                              )
                            }
                            className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-100 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleCopyLink(inv)}
                            className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-100 transition-colors min-w-[80px] text-center"
                          >
                            {copiedId === inv.id ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── PROFILE EDIT PANEL ── */}
      {profilePanelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setProfilePanelOpen(false)}
          />
          <aside className="fixed right-0 top-0 h-full w-96 z-50 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Edit Profile
              </h2>
              <button
                onClick={() => setProfilePanelOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Company Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Logo URL
                  <span className="text-slate-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <input
                  type="url"
                  value={editLogo}
                  onChange={(e) => setEditLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-5 border-t border-slate-100">
              <button
                onClick={() => setProfilePanelOpen(false)}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg py-2.5 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex-1 bg-black text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingProfile ? 'Saving…' : 'Save'}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: string;
  sub: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      {loading ? (
        <>
          <div className="h-8 w-12 bg-slate-200 rounded animate-pulse mb-1.5" />
          <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
        </>
      ) : (
        <>
          <p className="text-3xl font-black text-slate-900">{value}</p>
          {sub && (
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'Pending' | 'Paid' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        status === 'Paid'
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {status}
    </span>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-slate-100">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="px-6 py-4 flex items-center gap-6 animate-pulse"
        >
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-3 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-3 w-16 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
          <div className="flex gap-2 ml-auto">
            <div className="h-7 w-12 bg-slate-100 rounded-md" />
            <div className="h-7 w-20 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center">
      <p className="text-slate-400 font-medium">No invoices yet.</p>
      <p className="text-sm text-slate-400 mt-1">
        Create your first invoice to get started.
      </p>
      <button
        onClick={onNew}
        className="mt-6 bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
      >
        Create Invoice
      </button>
    </div>
  );
}