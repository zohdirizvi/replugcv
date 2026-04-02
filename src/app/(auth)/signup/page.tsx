"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
      else setChecking(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  }

  if (checking) {
    return (
      <div className="flex items-center gap-3 text-tertiary text-sm">
        <svg className="size-5 animate-spin" viewBox="0 0 20 20" fill="none">
          <circle className="stroke-current opacity-30" cx="10" cy="10" r="8" strokeWidth="2" />
          <circle className="origin-center animate-spin stroke-current" cx="10" cy="10" r="8" strokeWidth="2" strokeDasharray="12.5 50" strokeLinecap="round" />
        </svg>
        Checking session...
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-xl font-extrabold text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>R</div>
        <h1 className="text-display-xs font-bold text-primary" style={{ fontFamily: "'Manrope', sans-serif" }}>ReplugCV</h1>
        <p className="mt-2 text-sm text-tertiary">Create your free account</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary">Full Name</label>
          <input
            type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe" autoFocus autoComplete="name"
            className="w-full rounded-lg border border-primary bg-primary px-3.5 py-2.5 text-sm text-primary shadow-xs outline-none placeholder:text-placeholder focus:border-brand-solid focus:ring-4 focus:ring-brand-solid/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary">Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email"
            className="w-full rounded-lg border border-primary bg-primary px-3.5 py-2.5 text-sm text-primary shadow-xs outline-none placeholder:text-placeholder focus:border-brand-solid focus:ring-4 focus:ring-brand-solid/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary">Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters" autoComplete="new-password"
            className="w-full rounded-lg border border-primary bg-primary px-3.5 py-2.5 text-sm text-primary shadow-xs outline-none placeholder:text-placeholder focus:border-brand-solid focus:ring-4 focus:ring-brand-solid/10"
          />
        </div>
        <Button type="submit" color="primary" size="lg" className="w-full" isLoading={loading} isDisabled={loading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-tertiary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-secondary hover:text-brand-secondary_hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
