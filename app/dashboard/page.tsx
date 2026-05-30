"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { savePayoutSettings } from "@/app/actions/savePayoutSettings";
import type { InvoiceData, Profile } from "@/types";

const styles = `
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
  body { font-family: var(--font-body); background: var(--paper); -webkit-font-smoothing: antialiased; }

  /* Nav */
  .db-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 30;
    background: var(--paper);
    border-bottom: 1px solid var(--rule);
    height: 56px;
  }
  .db-nav-inner {
    max-width: 1200px; margin: 0 auto; padding: 0 32px;
    height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .db-wordmark {
    font-family: var(--font-display); font-weight: 700; font-size: 1.125rem;
    color: var(--ink); text-decoration: none; letter-spacing: -0.02em; cursor: pointer;
    line-height: 1;
  }
  .db-workspace {
    font-family: var(--font-mono); font-size: 0.6875rem;
    color: var(--ink-muted); letter-spacing: 0.04em; margin-top: 1px;
  }
  .db-nav-right { display: flex; align-items: center; gap: 12px; }
  .btn-new-invoice {
    font-family: var(--font-body); font-size: 0.8125rem; font-weight: 600;
    color: var(--paper); background: var(--ink); border: none;
    padding: 8px 18px; cursor: pointer; transition: background 0.15s; letter-spacing: 0.01em;
    text-decoration: none; display: inline-block;
  }
  .btn-new-invoice:hover { background: #2A2A28; }
  .avatar-btn {
    width: 34px; height: 34px; background: var(--ink); color: var(--paper);
    font-family: var(--font-display); font-size: 0.875rem; font-weight: 700;
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s; flex-shrink: 0;
  }
  .avatar-btn:hover { background: #2A2A28; }
  .dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: white; border: 1px solid var(--rule);
    min-width: 160px; z-index: 40;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  .dropdown-btn {
    width: 100%; text-align: left; padding: 12px 16px;
    font-size: 0.875rem; font-family: var(--font-body);
    background: none; border: none; cursor: pointer;
    color: var(--ink-soft); transition: background 0.1s;
    display: block;
  }
  .dropdown-btn:hover { background: var(--paper); color: var(--ink); }
  .dropdown-btn.danger { color: #991B1B; border-top: 1px solid var(--rule); }
  .dropdown-btn.danger:hover { background: #FEF2F2; }

  /* Banner */
  .banner {
    position: fixed; top: 56px; left: 0; right: 0; z-index: 20;
    background: #FFFBEB; border-bottom: 1px solid #E2D4A2;
    padding: 10px 32px; display: flex; align-items: center; justify-content: space-between;
  }
  .banner-text { font-size: 0.8125rem; color: #6B5A1A; }
  .banner-link { font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer; color: inherit; font-family: var(--font-body); font-size: inherit; }
  .banner-close { background: none; border: none; cursor: pointer; color: #92800A; font-size: 1.125rem; line-height: 1; }

  /* Main */
  .db-main { max-width: 1200px; margin: 0 auto; padding: 80px 32px 64px; }
  .db-main.with-banner { padding-top: 116px; }

  /* Stat row */
  .stat-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--rule); margin-bottom: 32px;
  }
  .stat-cell {
    padding: 28px 32px;
    border-right: 1px solid var(--rule);
  }
  .stat-cell:last-child { border-right: none; }
  .stat-label {
    font-family: var(--font-mono); font-size: 0.625rem;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 8px;
  }
  .stat-value {
    font-family: var(--font-display); font-size: 2rem; font-weight: 900;
    color: var(--ink); letter-spacing: -0.03em; line-height: 1;
  }
  .stat-sub { font-size: 0.75rem; color: var(--ink-muted); margin-top: 4px; font-family: var(--font-mono); }
  .stat-value.pending { color: #92580A; }
  .stat-value.paid { color: var(--accent); }

  /* Skeleton */
  .skel { background: var(--rule); border-radius: 2px; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

  /* Invoice table */
  .table-card { border: 1px solid var(--rule); background: white; }
  .table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid var(--rule); gap: 16px; flex-wrap: wrap;
  }
  .table-title {
    font-family: var(--font-display); font-size: 1rem; font-weight: 700;
    color: var(--ink); letter-spacing: -0.01em;
  }
  .search-input {
    border: 1px solid var(--rule); background: var(--paper);
    padding: 8px 12px; font-size: 0.8125rem; font-family: var(--font-body);
    color: var(--ink); outline: none; width: 220px; transition: border-color 0.15s;
  }
  .search-input::placeholder { color: var(--ink-muted); }
  .search-input:focus { border-color: var(--ink-soft); }

  .inv-table { width: 100%; border-collapse: collapse; }
  .inv-thead tr {
    border-bottom: 1px solid var(--rule);
  }
  .inv-thead th {
    padding: 10px 20px; text-align: left;
    font-family: var(--font-mono); font-size: 0.5625rem;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted);
    font-weight: 500;
  }
  .inv-thead th:last-child { text-align: right; }
  .inv-tbody tr {
    border-bottom: 1px solid var(--rule); transition: background 0.1s;
  }
  .inv-tbody tr:last-child { border-bottom: none; }
  .inv-tbody tr:hover { background: var(--paper); }
  .inv-td { padding: 14px 20px; font-size: 0.875rem; color: var(--ink-soft); vertical-align: middle; }
  .inv-td.mono { font-family: var(--font-mono); font-size: 0.75rem; color: var(--ink-muted); }
  .inv-td.client-name { font-weight: 500; color: var(--ink); font-size: 0.875rem; }
  .inv-td.client-email { font-size: 0.75rem; color: var(--ink-muted); margin-top: 2px; }
  .inv-td.amount { font-family: var(--font-mono); font-weight: 500; color: var(--ink); }
  .inv-td.actions { text-align: right; }

  .status-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--font-mono); font-size: 0.625rem;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 4px 8px; font-weight: 500;
  }
  .status-pill.paid { background: var(--accent-light); color: var(--accent); border: 1px solid #C8DCC8; }
  .status-pill.pending { background: #FFFBEB; color: #92580A; border: 1px solid #E2D4A2; }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; }
  .status-dot.paid { background: var(--accent); }
  .status-dot.pending { background: #D97706; }

  .action-btn {
    font-family: var(--font-body); font-size: 0.75rem; font-weight: 500;
    color: var(--ink-soft); border: 1px solid var(--rule); background: none;
    padding: 6px 12px; cursor: pointer; transition: all 0.1s; text-decoration: none;
    display: inline-block;
  }
  .action-btn:hover { background: var(--paper); color: var(--ink); border-color: var(--ink-muted); }
  .actions-row { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }

  /* Empty state */
  .empty-state {
    padding: 80px 32px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
  }
  .empty-icon {
    width: 40px; height: 40px; color: var(--rule); margin-bottom: 20px;
  }
  .empty-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
  .empty-body { font-size: 0.875rem; color: var(--ink-muted); max-width: 280px; line-height: 1.6; margin-bottom: 28px; font-weight: 300; }
  .btn-empty { font-family: var(--font-body); font-size: 0.875rem; font-weight: 600; color: var(--paper); background: var(--ink); border: none; padding: 12px 28px; cursor: pointer; transition: background 0.15s; }
  .btn-empty:hover { background: #2A2A28; }

  /* Skeleton rows */
  .skel-row { display: flex; align-items: center; gap: 24px; padding: 16px 20px; border-bottom: 1px solid var(--rule); }
  .skel-row:last-child { border-bottom: none; }

  /* Panel */
  .panel-overlay { position: fixed; inset: 0; z-index: 40; background: rgba(0,0,0,0.3); }
  .panel {
    position: fixed; right: 0; top: 0; height: 100%; width: 400px;
    z-index: 50; background: white; display: flex; flex-direction: column;
    border-left: 1px solid var(--rule);
  }
  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--rule);
  }
  .panel-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .panel-close { background: none; border: none; cursor: pointer; color: var(--ink-muted); font-size: 1.25rem; line-height: 1; transition: color 0.15s; }
  .panel-close:hover { color: var(--ink); }

  .panel-tabs { display: flex; border-bottom: 1px solid var(--rule); padding: 0 24px; }
  .panel-tab {
    padding: 12px 0; margin-right: 24px;
    font-size: 0.8125rem; font-weight: 500; font-family: var(--font-body);
    border: none; border-bottom: 2px solid transparent; margin-bottom: -1px;
    background: transparent; cursor: pointer; color: var(--ink-muted);
    transition: color 0.15s, border-color 0.15s;
  }
  .panel-tab.active { border-bottom-color: var(--ink); color: var(--ink); }
  .panel-tab:hover:not(.active) { color: var(--ink-soft); }

  .panel-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

  .field-label { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--ink-soft); margin-bottom: 6px; }
  .field-input {
    width: 100%; border: 1px solid var(--rule); background: var(--paper);
    color: var(--ink); padding: 10px 12px; font-size: 0.875rem;
    font-family: var(--font-body); outline: none; transition: border-color 0.15s;
  }
  .field-input:focus { border-color: var(--ink-soft); }
  .field-input.mono { font-family: var(--font-mono); }

  .payout-notice {
    padding: 12px 14px; background: #FFFBEB; border: 1px solid #E2D4A2;
    font-size: 0.8125rem; color: #6B5A1A; line-height: 1.55; font-weight: 300;
  }
  .configured-badge {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 0.6875rem; color: var(--accent);
    letter-spacing: 0.05em;
  }
  .configured-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

  .alert-error { padding: 10px 12px; background: #FEF2F2; border: 1px solid #FECACA; font-size: 0.8125rem; color: #991B1B; }
  .alert-success { padding: 10px 12px; background: var(--accent-light); border: 1px solid #C8DCC8; font-size: 0.8125rem; color: var(--accent); }

  .panel-footer { padding: 16px 24px; border-top: 1px solid var(--rule); display: flex; gap: 10px; }
  .btn-cancel {
    flex: 1; border: 1px solid var(--rule); background: none; color: var(--ink-soft);
    font-size: 0.875rem; font-weight: 500; font-family: var(--font-body);
    padding: 11px; cursor: pointer; transition: all 0.15s;
  }
  .btn-cancel:hover { border-color: var(--ink-muted); color: var(--ink); }
  .btn-save {
    flex: 1; background: var(--ink); color: var(--paper); border: none;
    font-size: 0.875rem; font-weight: 600; font-family: var(--font-body);
    padding: 11px; cursor: pointer; transition: background 0.15s;
  }
  .btn-save:hover:not(:disabled) { background: #2A2A28; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

  @media (max-width: 768px) {
    .db-main { padding: 72px 20px 48px; }
    .stat-row { grid-template-columns: 1fr; }
    .stat-cell { border-right: none; border-bottom: 1px solid var(--rule); }
    .stat-cell:last-child { border-bottom: none; }
    .panel { width: 100%; border-left: none; }
    .db-nav-inner { padding: 0 20px; }
    .search-input { width: 100%; }
  }
`;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}
function invoiceAmount(invoice: InvoiceData): number { return invoice.total_amount_paise / 100; }
function formatUSD(value: number): string { return value.toLocaleString("en-US", { style: "currency", currency: "USD" }); }
function getInitial(name: string): string { return name.trim().charAt(0).toUpperCase() || "?"; }

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "payout">("profile");
  const [editKeyId, setEditKeyId] = useState("");
  const [editKeySecret, setEditKeySecret] = useState("");
  const [editUpiId, setEditUpiId] = useState("");
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      currentUserIdRef.current = user.id;
      const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileRow) setProfile(profileRow as Profile);
      const { data: invoiceRows } = await supabase.from("invoices").select("*, public_sharing_token").eq("user_id", user.id).order("created_at", { ascending: false });
      if (invoiceRows) setInvoices(invoiceRows as InvoiceData[]);
      setLoading(false);
    }
    init();
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const userId = currentUserIdRef.current;
    if (!userId) return;
    const channel = supabase.channel("dashboard-invoices")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "invoices", filter: `user_id=eq.${userId}` }, (payload) => {
        setInvoices((prev) => [payload.new as InvoiceData, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "invoices", filter: `user_id=eq.${userId}` }, (payload) => {
        setInvoices((prev) => prev.map((inv) => inv.id === (payload.new as InvoiceData).id ? (payload.new as InvoiceData) : inv));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loading]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() { await supabase.auth.signOut(); router.push("/login"); }

  function openProfilePanel() {
    setEditName(profile?.company_name ?? "");
    setEditEmail(profile?.company_email ?? "");
    setEditLogo(profile?.company_logo_url ?? "");
    setEditKeyId(""); setEditKeySecret("");
    setEditUpiId(profile?.user_upi_id ?? "");
    setPayoutError(null); setPayoutSuccess(false);
    setProfileTab("profile"); setProfilePanelOpen(true); setDropdownOpen(false);
  }

  async function handleSaveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    const { data, error } = await supabase.from("profiles").upsert({ id: profile.id, company_name: editName, company_email: editEmail, company_logo_url: editLogo || null, updated_at: new Date().toISOString() }).select("*").single();
    setSavingProfile(false);
    if (!error && data) { setProfile(data as Profile); setProfilePanelOpen(false); }
  }

  async function handleSavePayoutSettings() {
    setPayoutError(null); setPayoutSuccess(false); setPayoutSaving(true);
    const result = await savePayoutSettings({ razorpayKeyId: editKeyId, razorpayKeySecret: editKeySecret, upiId: editUpiId || undefined });
    setPayoutSaving(false);
    if ("error" in result) { setPayoutError(result.error); }
    else {
      setPayoutSuccess(true);
      const { data } = await supabase.from("profiles").select("*").eq("id", profile!.id).single();
      if (data) setProfile(data as Profile);
      setTimeout(() => setPayoutSuccess(false), 3000);
    }
  }

  async function handleCopyLink(inv: InvoiceData) {
    await navigator.clipboard.writeText(`${window.location.origin}/invoice/${inv.public_sharing_token}`);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const profileIncomplete = profile !== null && (profile.company_name.trim() === "" || profile.company_email.trim() === "");
  const filtered = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return inv.client_name.toLowerCase().includes(q) || inv.invoice_number.toLowerCase().includes(q);
  });
  const totalPendingValue = invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + invoiceAmount(i), 0);
  const totalPaidValue = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + invoiceAmount(i), 0);

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", background: "var(--paper)" }}>

        {/* Nav */}
        <header className="db-nav">
          <div className="db-nav-inner">
            <div onClick={() => router.push("/dashboard")} style={{ cursor: "pointer" }}>
              <div className="db-wordmark">SmartBill</div>
              {loading
                ? <div className="skel" style={{ width: 100, height: 11, marginTop: 3 }} />
                : <div className="db-workspace">{profile?.company_name || "Your workspace"}</div>
              }
            </div>
            <div className="db-nav-right">
              <button className="btn-new-invoice" onClick={() => router.push("/invoice/new")}>New Invoice</button>
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button className="avatar-btn" onClick={() => setDropdownOpen((o) => !o)}>
                  {getInitial(profile?.company_name ?? "")}
                </button>
                {dropdownOpen && (
                  <div className="dropdown">
                    <button className="dropdown-btn" onClick={openProfilePanel}>Account Settings</button>
                    <button className="dropdown-btn danger" onClick={handleSignOut}>Sign Out</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Banner */}
        {!loading && profileIncomplete && !bannerDismissed && (
          <div className="banner">
            <p className="banner-text">
              Your profile is incomplete — invoices won&apos;t show your company details.{" "}
              <button className="banner-link" onClick={openProfilePanel}>Complete it now</button>
            </p>
            <button className="banner-close" onClick={() => setBannerDismissed(true)} aria-label="Dismiss">×</button>
          </div>
        )}

        {/* Main */}
        <main className={`db-main${!loading && profileIncomplete && !bannerDismissed ? " with-banner" : ""}`}>

          {/* Stats */}
          <div className="stat-row">
            <div className="stat-cell">
              <div className="stat-label">Total Invoices</div>
              {loading ? <div className="skel" style={{ width: 48, height: 32, marginTop: 4 }} /> : <div className="stat-value">{invoices.length}</div>}
            </div>
            <div className="stat-cell">
              <div className="stat-label">Pending</div>
              {loading ? <div className="skel" style={{ width: 40, height: 32, marginTop: 4 }} /> : (
                <>
                  <div className="stat-value pending">{invoices.filter((i) => i.status === "Pending").length}</div>
                  <div className="stat-sub">{formatUSD(totalPendingValue)} outstanding</div>
                </>
              )}
            </div>
            <div className="stat-cell">
              <div className="stat-label">Paid</div>
              {loading ? <div className="skel" style={{ width: 40, height: 32, marginTop: 4 }} /> : (
                <>
                  <div className="stat-value paid">{invoices.filter((i) => i.status === "Paid").length}</div>
                  <div className="stat-sub">{formatUSD(totalPaidValue)} collected</div>
                </>
              )}
            </div>
          </div>

          {/* Invoice table */}
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Invoices</h2>
              <input
                type="text"
                placeholder="Search by client or invoice #"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {loading ? (
              <div>
                {[0,1,2].map((i) => (
                  <div key={i} className="skel-row">
                    <div className="skel" style={{ width: 80, height: 12 }} />
                    <div className="skel" style={{ width: 130, height: 12 }} />
                    <div className="skel" style={{ width: 80, height: 12 }} />
                    <div className="skel" style={{ width: 64, height: 12 }} />
                    <div className="skel" style={{ width: 56, height: 20, marginLeft: "auto" }} />
                  </div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="empty-title">No invoices yet</p>
                <p className="empty-body">Create your first invoice and share it with a client in under 60 seconds.</p>
                <button className="btn-empty" onClick={() => router.push("/invoice/new")}>Create Invoice</button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="inv-table">
                  <thead className="inv-thead">
                    <tr>
                      <th>Invoice #</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="inv-tbody">
                    {filtered.map((inv) => (
                      <tr key={inv.id}>
                        <td className="inv-td mono">{inv.invoice_number}</td>
                        <td className="inv-td">
                          <div className="inv-td client-name" style={{ padding: 0 }}>{inv.client_name}</div>
                          <div className="inv-td client-email" style={{ padding: 0 }}>{inv.client_email}</div>
                        </td>
                        <td className="inv-td">{formatDate(inv.created_at)}</td>
                        <td className="inv-td amount">{formatUSD(invoiceAmount(inv))}</td>
                        <td className="inv-td">
                          <span className={`status-pill ${inv.status === "Paid" ? "paid" : "pending"}`}>
                            <span className={`status-dot ${inv.status === "Paid" ? "paid" : "pending"}`} />
                            {inv.status}
                          </span>
                        </td>
                        <td className="inv-td actions">
                          <div className="actions-row">
                            <button className="action-btn" onClick={() => router.push(`/invoice/${inv.public_sharing_token}`)}>View</button>
                            <button className="action-btn" onClick={() => handleCopyLink(inv)} style={{ minWidth: 88 }}>
                              {copiedId === inv.id ? "Copied!" : "Copy Link"}
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

        {/* Profile Panel */}
        {profilePanelOpen && (
          <>
            <div className="panel-overlay" onClick={() => setProfilePanelOpen(false)} />
            <aside className="panel">
              <div className="panel-head">
                <h2 className="panel-title">Account Settings</h2>
                <button className="panel-close" onClick={() => setProfilePanelOpen(false)}>×</button>
              </div>

              <div className="panel-tabs">
                {(["profile", "payout"] as const).map((t) => (
                  <button key={t} onClick={() => setProfileTab(t)} className={`panel-tab${profileTab === t ? " active" : ""}`}>
                    {t === "profile" ? "Profile" : "Payout"}
                  </button>
                ))}
              </div>

              <div className="panel-body">
                {profileTab === "profile" ? (
                  <>
                    <div>
                      <label className="field-label">Company Name</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">Company Email</label>
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">Logo URL <span style={{ color: "var(--ink-muted)", fontWeight: 300 }}>(optional)</span></label>
                      <input type="url" value={editLogo} onChange={(e) => setEditLogo(e.target.value)} placeholder="https://..." className="field-input" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="payout-notice">
                      Your Razorpay credentials are encrypted before storage. Client payments go directly to your account — SmartBill never holds funds.
                    </div>
                    <div>
                      <label className="field-label">Razorpay Key ID</label>
                      <input type="text" value={editKeyId} onChange={(e) => setEditKeyId(e.target.value)} placeholder="rzp_live_..." autoComplete="off" className="field-input mono" />
                    </div>
                    <div>
                      <label className="field-label">Razorpay Key Secret</label>
                      <input type="password" value={editKeySecret} onChange={(e) => setEditKeySecret(e.target.value)} placeholder="••••••••••••••••" autoComplete="new-password" className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">UPI ID <span style={{ color: "var(--ink-muted)", fontWeight: 300 }}>(optional)</span></label>
                      <input type="text" value={editUpiId} onChange={(e) => setEditUpiId(e.target.value)} placeholder="yourname@upi" className="field-input mono" />
                    </div>
                    {payoutError && <div className="alert-error">{payoutError}</div>}
                    {payoutSuccess && <div className="alert-success">Payout settings saved.</div>}
                    {profile?.payout_configured && (
                      <div className="configured-badge">
                        <span className="configured-dot" />
                        Credentials configured — enter new values to update
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="panel-footer">
                <button className="btn-cancel" onClick={() => setProfilePanelOpen(false)}>Cancel</button>
                <button
                  className="btn-save"
                  onClick={profileTab === "profile" ? handleSaveProfile : handleSavePayoutSettings}
                  disabled={profileTab === "profile" ? savingProfile : payoutSaving}
                >
                  {profileTab === "profile"
                    ? (savingProfile ? "Saving…" : "Save Profile")
                    : (payoutSaving ? "Saving…" : "Save Payout")}
                </button>
              </div>
            </aside>
          </>
        )}
      </div>
    </>
  );
}