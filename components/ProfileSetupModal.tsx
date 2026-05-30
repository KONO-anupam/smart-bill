// components/ProfileSetupModal
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface ProfileSetupModalProps {
  userId: string;
  onComplete: () => void;
}

export default function ProfileSetupModal({
  userId,
  onComplete,
}: ProfileSetupModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setError(null);
    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!companyEmail.trim()) {
      setError("Company email is required.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        company_name: companyName.trim(),
        company_email: companyEmail.trim(),
        company_logo_url: logoUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Progress hint */}
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Step 1 of 1 — Company Profile
          </p>
        </div>

        <div className="px-8 py-8">
          <div className="mb-7">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Set up your company profile
            </h2>
            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
              This info will appear on every invoice you create. You can update it at any time from settings.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Company Name <span className="text-slate-400 font-normal">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Company Email <span className="text-slate-400 font-normal">*</span>
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="billing@acme.com"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Company Logo URL{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://yoursite.com/logo.png"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-1 bg-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 shrink-0"
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
              )}
              {loading ? "Saving…" : "Save Profile & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}