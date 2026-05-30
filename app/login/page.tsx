"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import ProfileSetupModal from "@/components/ProfileSetupModal";

type Tab = "signin" | "signup";

const sharedStyles = `
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
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); -webkit-font-smoothing: antialiased; }

  .login-wrap {
    min-height: 100vh;
    display: flex;
    background: var(--paper);
  }
  .login-left {
    display: none;
    width: 44%;
    background: var(--ink);
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    flex-shrink: 0;
  }
  @media (min-width: 1024px) { .login-left { display: flex; } }

  .login-wordmark {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--paper);
    text-decoration: none;
    letter-spacing: -0.02em;
  }
  .login-headline {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 900;
    color: var(--paper);
    line-height: 1.1;
    letter-spacing: -0.025em;
    margin-bottom: 40px;
  }
  .login-headline em { font-style: italic; color: #B8D4B8; }
  .login-features { list-style: none; display: flex; flex-direction: column; gap: 20px; }
  .login-feature {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid #2A2A28;
  }
  .login-feature-icon {
    width: 16px;
    height: 16px;
    color: #B8D4B8;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .login-feature-text {
    font-size: 0.875rem;
    color: #888882;
    line-height: 1.5;
    font-weight: 300;
  }
  .login-copy {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: #3A3A38;
    letter-spacing: 0.04em;
  }

  .login-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    background: var(--paper);
  }
  .login-mobile-logo {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--ink);
    text-decoration: none;
    letter-spacing: -0.02em;
    margin-bottom: 40px;
    display: block;
  }
  @media (min-width: 1024px) { .login-mobile-logo { display: none; } }

  .login-form-wrap { width: 100%; max-width: 360px; }

  .redirect-notice {
    margin-bottom: 24px;
    padding: 12px 14px;
    background: #FFFBEB;
    border: 1px solid #E2D4A2;
    font-size: 0.8125rem;
    color: #6B5A1A;
    line-height: 1.5;
  }
  .redirect-notice code {
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .login-title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 900;
    color: var(--ink);
    letter-spacing: -0.025em;
    margin-bottom: 4px;
  }
  .login-subtitle {
    font-size: 0.875rem;
    color: var(--ink-muted);
    margin-bottom: 32px;
    font-weight: 300;
  }

  .tab-row {
    display: flex;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 28px;
  }
  .tab-btn {
    padding: 10px 0;
    margin-right: 28px;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: var(--font-body);
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    background: transparent;
    cursor: pointer;
    color: var(--ink-muted);
    transition: color 0.15s, border-color 0.15s;
  }
  .tab-btn.active { border-bottom-color: var(--ink); color: var(--ink); }
  .tab-btn:hover:not(.active) { color: var(--ink-soft); }

  .form-fields { display: flex; flex-direction: column; gap: 16px; }
  .field-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--ink-soft);
    margin-bottom: 6px;
    letter-spacing: 0.01em;
  }
  .field-input {
    width: 100%;
    border: 1px solid var(--rule);
    background: white;
    color: var(--ink);
    padding: 10px 14px;
    font-size: 0.875rem;
    font-family: var(--font-body);
    outline: none;
    transition: border-color 0.15s;
    -webkit-appearance: none;
  }
  .field-input::placeholder { color: var(--ink-muted); }
  .field-input:focus { border-color: var(--ink-soft); }
  .field-input:disabled { opacity: 0.5; }

  .alert-error {
    padding: 10px 14px;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    font-size: 0.8125rem;
    color: #991B1B;
  }
  .alert-info {
    padding: 10px 14px;
    background: var(--accent-light);
    border: 1px solid #C8DCC8;
    font-size: 0.8125rem;
    color: var(--accent);
  }

  .btn-submit {
    width: 100%;
    background: var(--ink);
    color: var(--paper);
    border: none;
    padding: 13px 20px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: var(--font-body);
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.01em;
    margin-top: 4px;
  }
  .btn-submit:hover:not(:disabled) { background: #2A2A28; }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-forgot {
    font-size: 0.8125rem;
    color: var(--ink-muted);
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    text-align: left;
    transition: color 0.15s;
    padding: 0;
  }
  .btn-forgot:hover { color: var(--ink-soft); }
  .btn-forgot:disabled { opacity: 0.5; }

  .back-link {
    margin-top: 36px;
    font-size: 0.8125rem;
    color: var(--ink-muted);
    text-decoration: none;
    font-family: var(--font-mono);
    display: block;
    text-align: center;
    transition: color 0.15s;
  }
  .back-link:hover { color: var(--ink-soft); }
`;

function LoginPage() {
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
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) { setError(signInError.message); return; }
    router.push(redirectedFrom ?? "/dashboard");
  }

  async function handleForgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) { setError("Enter your email first."); return; }
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    setInfo("Password reset email sent.");
  }

  async function handleSignUp() {
    setError(null);
    setInfo(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) { setError(signUpError.message); return; }
    const userId = data.user?.id;
    if (!userId) { setError("Sign up succeeded but no user ID was returned. Try signing in."); return; }
    setNewUserId(userId);
  }

  function handleModalComplete() {
    setNewUserId(null);
    router.push(redirectedFrom ?? "/dashboard");
  }

  return (
    <>
      <style>{sharedStyles}</style>
      <div className="login-wrap">
        {newUserId && <ProfileSetupModal userId={newUserId} onComplete={handleModalComplete} />}

        {/* Left panel */}
        <div className="login-left">
          <Link href="/" className="login-wordmark">SmartBill</Link>
          <div>
            <p className="login-headline">
              Send an invoice.<br />
              Get paid.<br />
              <em>That simple.</em>
            </p>
            <ul className="login-features">
              {[
                { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />, text: "Payment status updates the moment your client pays" },
                { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />, text: "Every invoice gets a permanent link you can share anywhere" },
                { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />, text: "Client payments go directly to your Razorpay account" },
              ].map(({ icon, text }, i) => (
                <li key={i} className="login-feature">
                  <svg className="login-feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{icon}</svg>
                  <span className="login-feature-text">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="login-copy">© 2025 SmartBill — free for solo freelancers</p>
        </div>

        {/* Right panel */}
        <div className="login-right">
          <Link href="/" className="login-mobile-logo">SmartBill</Link>

          <div className="login-form-wrap">
            {redirectedFrom && (
              <div className="redirect-notice">
                Sign in to continue to <code>{redirectedFrom}</code>.
              </div>
            )}

            <h1 className="login-title">
              {tab === "signin" ? "Welcome back." : "Create an account."}
            </h1>
            <p className="login-subtitle">
              {tab === "signin" ? "Sign in to your SmartBill workspace." : "Free to start. No credit card required."}
            </p>

            <div className="tab-row">
              {(["signin", "signup"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`tab-btn${tab === t ? " active" : ""}`}
                >
                  {t === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <div className="form-fields">
              <div>
                <label htmlFor="email" className="field-label">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field-input"
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete={tab === "signin" ? "current-password" : "new-password"}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field-input"
                />
              </div>

              {tab === "signup" && (
                <div>
                  <label htmlFor="confirm-password" className="field-label">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="field-input"
                  />
                </div>
              )}

              {error && <div className="alert-error">{error}</div>}
              {info && <div className="alert-info">{info}</div>}

              <button
                onClick={tab === "signin" ? handleSignIn : handleSignUp}
                disabled={loading}
                className="btn-submit"
              >
                {loading && <Spinner />}
                {tab === "signin" ? "Sign In" : "Create Account"}
              </button>

              {tab === "signin" && (
                <button onClick={handleForgotPassword} disabled={loading} className="btn-forgot">
                  Forgot your password?
                </button>
              )}
            </div>
          </div>

          <Link href="/" className="back-link">← Back to home</Link>
        </div>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" style={{ width: 14, height: 14, flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}