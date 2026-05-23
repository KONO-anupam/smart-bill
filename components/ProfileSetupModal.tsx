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

    // Update existing row created by SQL trigger
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
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Set Up Your Company Profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            This info will appear on every invoice you create.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Company Email *
            </label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="billing@acme.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Company Logo URL (optional)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}