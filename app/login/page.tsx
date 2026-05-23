"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import ProfileSetupModal from "@/components/ProfileSetupModal";

type Tab = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
    setInfo(null);
  }

  async function handleSignIn() {
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(redirectedFrom ?? "/dashboard");
  }

  async function handleForgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    setInfo("Password reset email sent.");
  }

  async function handleSignUp() {
    setError(null);
    setInfo(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError(
        "Sign up succeeded but no user ID was returned. Try signing in."
      );
      return;
    }

    setNewUserId(userId);
  }

  function handleModalComplete() {
    setNewUserId(null);
    router.push(redirectedFrom ?? "/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      {newUserId && (
        <ProfileSetupModal
          userId={newUserId}
          onComplete={handleModalComplete}
        />
      )}

      {redirectedFrom && (
        <p className="mb-4 text-sm text-amber-400 text-center max-w-md">
          Sign in to continue to{" "}
          <span className="font-mono">{redirectedFrom}</span>.
        </p>
      )}

      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        <div className="px-8 pt-8 pb-4 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">
            InvoiceFlow
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            The intelligent invoice engine
          </p>
        </div>

        <div className="flex border-b border-slate-800 px-8">
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`pb-3 mr-6 text-sm font-semibold border-b-2 transition-colors ${
                tab === t
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="px-8 py-7 flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                tab === "signin" ? "current-password" : "new-password"
              }
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition"
            />
          </div>

          {tab === "signup" && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-green-400">{info}</p>}

          <button
            onClick={tab === "signin" ? handleSignIn : handleSignUp}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-md py-2.5 text-sm transition flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            {tab === "signin" ? "Sign In" : "Create Account"}
          </button>

          {tab === "signin" && (
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm text-slate-500 hover:text-slate-300 disabled:opacity-50 transition text-left"
            >
              Forgot your password?
            </button>
          )}
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 text-sm text-slate-600 hover:text-slate-400 transition"
      >
        ← Back to home
      </Link>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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