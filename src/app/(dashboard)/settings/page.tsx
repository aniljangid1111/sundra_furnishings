"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock,
  CreditCard,
  Percent,
  Sparkles,
} from "lucide-react";

interface SettingModulePreview {
  title: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  badge: string;
}

const upcomingModules: SettingModulePreview[] = [
  {
    title: "1. Company Profile & Letterhead",
    description:
      "Manage legal business name, registered addresses, tax IDs (GSTIN/EIN), bank account coordinates, and custom invoice header logos.",
    icon: Building2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    badge: "Essential",
  },
  {
    title: "2. Tax Rules & Slabs",
    description:
      "Configure standard tax percentages, IGST/CGST/SGST slabs, HSN/SAC code mappings, and tax breakdown rules for wholesale and retail invoices.",
    icon: Percent,
    color: "text-amber-700",
    bg: "bg-amber-50",
    badge: "Compliance",
  },
  {
    title: "3. Payment Terms & Schedules",
    description:
      "Set default commercial billing terms (Net 15, Net 30, Cash on Delivery, Advance Deposit), late fee grace periods, and payment instructions.",
    icon: CreditCard,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    badge: "Finance",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              <Clock size={12} />
              Under Active Development
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              Sundara ERP v2.1
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            System Settings & Administration
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Enterprise configuration parameters, tax compliance, user permissions, and company branding.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3.5 text-xs font-semibold text-[var(--foreground)] shadow-2xs transition hover:bg-[var(--muted-background)]"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/invoices"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-3.5 text-xs font-semibold text-white! shadow-2xs transition hover:bg-[var(--primary-dark)]"
          >
            <span>Open Invoices</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Hero Notice Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50/70 via-white to-amber-50/30 p-6 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Sparkles size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Settings Modules Coming Soon
                </h2>
                <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                  Phase 2 Roadmap
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 sm:max-w-2xl">
                Dedicated administration panel for Sundara Furnishings: customize invoice letterhead & company profile, define standard tax slabs, and manage payment credit terms. Currently, standard business defaults and PDF coordinates are functioning out-of-the-box.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Planned Configuration Modules */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
            Essential Administration Modules
          </h2>
          <span className="text-xs text-[var(--muted)]">3 Core Modules in Pipeline</span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {upcomingModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${module.bg} ${module.color}`}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                      {module.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-900 group-hover:text-[var(--primary)] transition">
                    {module.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-[var(--border-light)] pt-3 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Scheduled release</span>
                  <span className="font-semibold text-amber-700">In Development</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Workflows Quick Reference Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900">
          Fully Operational Modules (Available Now)
        </h3>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          You can immediately use these core modules without needing any additional configuration.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-semibold">
          <Link
            href="/invoices"
            className="flex items-center justify-between rounded-xl border border-[var(--border-light)] bg-[var(--muted-background)] p-3 transition hover:bg-white hover:border-[var(--primary)]"
          >
            <span className="text-slate-800">Sales Invoices</span>
            <span className="text-[var(--primary)]">→</span>
          </Link>
          <Link
            href="/purchases"
            className="flex items-center justify-between rounded-xl border border-[var(--border-light)] bg-[var(--muted-background)] p-3 transition hover:bg-white hover:border-[var(--primary)]"
          >
            <span className="text-slate-800">Purchase Orders</span>
            <span className="text-[var(--primary)]">→</span>
          </Link>
          <Link
            href="/inventory"
            className="flex items-center justify-between rounded-xl border border-[var(--border-light)] bg-[var(--muted-background)] p-3 transition hover:bg-white hover:border-[var(--primary)]"
          >
            <span className="text-slate-800">Stock Inventory</span>
            <span className="text-[var(--primary)]">→</span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center justify-between rounded-xl border border-[var(--border-light)] bg-[var(--muted-background)] p-3 transition hover:bg-white hover:border-[var(--primary)]"
          >
            <span className="text-slate-800">Audit Reports & CSV</span>
            <span className="text-[var(--primary)]">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

