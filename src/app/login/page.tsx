"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fills Administrator credentials
  const handleFillAdmin = () => {
    setEmail("admin@sundarafurnishings.com");
    setPassword("Admin@123");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.push(redirectUrl);
    } catch (err: any) {
      setError(
        err?.message || "Invalid credentials. Please verify your email and password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8f7]">
      {/* Left side: Luxury Brand Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#11382b] p-12 text-white relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-[#1e5844] opacity-50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-[#0a231b] opacity-70 blur-2xl pointer-events-none" />

        {/* Top: Logo & Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-md">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#d4af37]">
                S
              </span>
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-wide text-white">
                Sundara Furnishings
              </h1>
              <p className="text-xs uppercase tracking-wider text-emerald-200/80 font-medium">
                Enterprise ERP & Invoicing Suite
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Brand Tagline */}
        <div className="relative z-10 my-auto max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <ShieldCheck size={14} />
            <span>Secure Enterprise Architecture</span>
          </div>
          <h2 className="font-serif text-4xl font-normal leading-tight text-white/95">
            Crafted for seamless operations, precision inventory, and global commerce.
          </h2>
          <p className="text-sm text-emerald-100/70 leading-relaxed">
            Manage multi-channel billing, automated landed cost calculations, and role-governed workflows from a unified command center.
          </p>
        </div>

        {/* Bottom: Security Notice */}
        <div className="relative z-10 text-xs text-emerald-200/60 flex items-center justify-between border-t border-white/10 pt-6">
          <span>Sundara Furnishings LLC &copy; {new Date().getFullYear()}</span>
          <span>US Commercial Standard</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176b52] text-white">
              <span className="font-serif text-xl font-bold text-[#d4af37]">S</span>
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-[#18211d]">
                Sundara Furnishings
              </h1>
              <p className="text-[11px] text-[#718078] tracking-tight">
                Billing & Inventory Suite
              </p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-[#18211d] sm:text-3xl">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#718078]">
              Sign in to your authorized staff account to continue.
            </p>
          </div>

          {/* 1-Click Administrator Login */}
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 transition-all">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-950 mb-2">
              <Sparkles size={14} className="text-[#176b52]" />
              <span>Administrator Quick Access</span>
            </div>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="w-full cursor-pointer rounded-lg border border-emerald-300 bg-white px-3 py-2 text-left font-semibold text-[#176b52] hover:bg-emerald-100/60 transition shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-800">Admin (Sundara Furnishings)</div>
                <div className="text-[11px] text-slate-500 font-mono">admin@sundarafurnishings.com</div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                Auto-Fill
              </span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 animate-in fade-in duration-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#18211d] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#718078]">
                  <Mail size={17} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sundarafurnishings.com"
                  className="w-full rounded-xl border border-[#e3e9e6] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#18211d] placeholder:text-[#718078]/60 focus:border-[#176b52] focus:outline-none focus:ring-2 focus:ring-[#176b52]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#18211d]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#718078]">
                  <Lock size={17} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#e3e9e6] bg-white py-2.5 pl-10 pr-10 text-sm text-[#18211d] placeholder:text-[#718078]/60 focus:border-[#176b52] focus:outline-none focus:ring-2 focus:ring-[#176b52]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#718078] hover:text-[#18211d] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b52] py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#10523f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b52] disabled:opacity-70 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Sundara</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Assistance */}
          <div className="mt-8 border-t border-[#e3e9e6] pt-6 text-center text-xs text-[#718078]">
            <p>Protected by Sundara Role-Based Access Control.</p>
            <p className="mt-1 text-[11px] text-[#718078]/80">
              Need access? Contact system administrator at IT support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

