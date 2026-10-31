"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calculator,
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  Edit2,
  Image as ImageIcon,
  Percent,
  Plus,
  RefreshCw,
  Save,
  Star,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import {
  defaultCompanyProfile,
  defaultPaymentTerms,
  defaultTaxSettings,
  getStoredCompanyProfile,
  getStoredPaymentTerms,
  getStoredTaxSettings,
  saveStoredCompanyProfile,
  saveStoredPaymentTerms,
  saveStoredTaxSettings,
} from "@/features/settings/tax-settings.data";
import {
  CompanyProfile,
  PaymentTerm,
  TaxSettingsConfig,
  TaxSlab,
} from "@/features/settings/tax-settings.types";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"tax" | "company" | "payment">("tax");

  // State: Tax
  const [taxSettings, setTaxSettings] = useState<TaxSettingsConfig>(defaultTaxSettings);
  const [manualRateInput, setManualRateInput] = useState<string>("8.25");
  const [testAmount, setTestAmount] = useState<number>(1000);

  // State: Payment Terms
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>(defaultPaymentTerms);

  // State: Company Profile
  const [profile, setProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Tax Slab Modal
  const [isSlabModalOpen, setIsSlabModalOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<TaxSlab | null>(null);
  const [slabName, setSlabName] = useState("");
  const [slabRate, setSlabRate] = useState<number>(8.25);
  const [slabCode, setSlabCode] = useState("");
  const [slabDescription, setSlabDescription] = useState("");
  const [slabIsDefault, setSlabIsDefault] = useState(false);

  // Payment Term Modal
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null);
  const [termName, setTermName] = useState("");
  const [termDays, setTermDays] = useState<number>(30);
  const [termDescription, setTermDescription] = useState("");
  const [termIsDefault, setTermIsDefault] = useState(false);

  useEffect(() => {
    const loadedTax = getStoredTaxSettings();
    setTaxSettings(loadedTax);
    setManualRateInput(String(loadedTax.defaultTaxRate));

    const loadedTerms = getStoredPaymentTerms();
    setPaymentTerms(loadedTerms);

    const loadedProfile = getStoredCompanyProfile();
    setProfile(loadedProfile);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tax Handlers
  const handleApplyManualRate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rateNum = Math.max(0, parseFloat(manualRateInput) || 0);

    const updatedSlabs = taxSettings.slabs.map((s) => ({
      ...s,
      isDefault: s.rate === rateNum,
    }));

    const matchedSlab = taxSettings.slabs.find((s) => s.rate === rateNum);

    const updated: TaxSettingsConfig = {
      ...taxSettings,
      defaultTaxRate: rateNum,
      defaultTaxName: matchedSlab ? matchedSlab.name : `Custom Sales Tax (${rateNum}%)`,
      slabs: updatedSlabs,
    };

    setTaxSettings(updated);
    saveStoredTaxSettings(updated);
    showToast(`Default tax rate set to ${rateNum}% for all new invoices.`);
  };

  const handleSetDefaultSlab = (slabId: string) => {
    const target = taxSettings.slabs.find((s) => s.id === slabId);
    if (!target) return;

    const updatedSlabs = taxSettings.slabs.map((s) => ({
      ...s,
      isDefault: s.id === slabId,
    }));

    const updated: TaxSettingsConfig = {
      ...taxSettings,
      defaultTaxRate: target.rate,
      defaultTaxName: target.name,
      slabs: updatedSlabs,
    };

    setManualRateInput(String(target.rate));
    setTaxSettings(updated);
    saveStoredTaxSettings(updated);
    showToast(`"${target.name}" is now the default tax rate.`);
  };

  const handleToggleMode = (mode: "EXCLUSIVE" | "INCLUSIVE") => {
    const updated: TaxSettingsConfig = {
      ...taxSettings,
      taxCalculationMode: mode,
    };
    setTaxSettings(updated);
    saveStoredTaxSettings(updated);
    showToast(`Tax calculation set to ${mode.toLowerCase()}`);
  };

  const handleOpenAddSlab = () => {
    setEditingSlab(null);
    setSlabName("");
    setSlabRate(8.25);
    setSlabCode("US-TAX");
    setSlabDescription("");
    setSlabIsDefault(false);
    setIsSlabModalOpen(true);
  };

  const handleOpenEditSlab = (slab: TaxSlab) => {
    setEditingSlab(slab);
    setSlabName(slab.name);
    setSlabRate(slab.rate);
    setSlabCode(slab.taxCode || "");
    setSlabDescription(slab.description);
    setSlabIsDefault(slab.isDefault);
    setIsSlabModalOpen(true);
  };

  const handleSaveSlab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slabName.trim()) return;

    const rateNum = Number(slabRate) || 0;

    if (editingSlab) {
      const updatedSlabs = taxSettings.slabs.map((s) => {
        if (s.id === editingSlab.id) {
          return {
            ...s,
            name: slabName.trim(),
            rate: rateNum,
            taxCode: slabCode.trim().toUpperCase(),
            description: slabDescription.trim(),
            isDefault: slabIsDefault,
          };
        }
        return slabIsDefault ? { ...s, isDefault: false } : s;
      });

      const updated: TaxSettingsConfig = {
        ...taxSettings,
        slabs: updatedSlabs,
        ...(slabIsDefault
          ? { defaultTaxRate: rateNum, defaultTaxName: slabName.trim() }
          : {}),
      };

      if (slabIsDefault) setManualRateInput(String(rateNum));
      setTaxSettings(updated);
      saveStoredTaxSettings(updated);
      showToast(`Tax slab updated`);
    } else {
      const newSlab: TaxSlab = {
        id: `slab-${Date.now()}`,
        name: slabName.trim(),
        rate: rateNum,
        taxCode: slabCode.trim().toUpperCase() || "US-TAX",
        description: slabDescription.trim(),
        isDefault: slabIsDefault,
        isActive: true,
      };

      const updatedSlabs = taxSettings.slabs.map((s) =>
        slabIsDefault ? { ...s, isDefault: false } : s
      );

      const updated: TaxSettingsConfig = {
        ...taxSettings,
        slabs: [...updatedSlabs, newSlab],
        ...(slabIsDefault
          ? { defaultTaxRate: rateNum, defaultTaxName: slabName.trim() }
          : {}),
      };

      if (slabIsDefault) setManualRateInput(String(rateNum));
      setTaxSettings(updated);
      saveStoredTaxSettings(updated);
      showToast(`Tax slab created`);
    }

    setIsSlabModalOpen(false);
  };

  const handleDeleteSlab = (slabId: string) => {
    const target = taxSettings.slabs.find((s) => s.id === slabId);
    if (!target) return;
    if (target.isDefault) {
      alert("Cannot delete default tax rate. Set another rate as default first.");
      return;
    }
    if (confirm(`Delete "${target.name}"?`)) {
      const updatedSlabs = taxSettings.slabs.filter((s) => s.id !== slabId);
      const updated: TaxSettingsConfig = {
        ...taxSettings,
        slabs: updatedSlabs,
      };
      setTaxSettings(updated);
      saveStoredTaxSettings(updated);
      showToast(`Slab deleted`);
    }
  };

  // Payment Terms Handlers
  const handleOpenAddTerm = () => {
    setEditingTerm(null);
    setTermName("");
    setTermDays(30);
    setTermDescription("");
    setTermIsDefault(false);
    setIsTermModalOpen(true);
  };

  const handleOpenEditTerm = (term: PaymentTerm) => {
    setEditingTerm(term);
    setTermName(term.name);
    setTermDays(term.days);
    setTermDescription(term.description);
    setTermIsDefault(term.isDefault);
    setIsTermModalOpen(true);
  };

  const handleSaveTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termName.trim()) return;

    if (editingTerm) {
      const updated = paymentTerms.map((t) => {
        if (t.id === editingTerm.id) {
          return {
            ...t,
            name: termName.trim(),
            days: Number(termDays) || 0,
            description: termDescription.trim(),
            isDefault: termIsDefault,
          };
        }
        return termIsDefault ? { ...t, isDefault: false } : t;
      });
      setPaymentTerms(updated);
      saveStoredPaymentTerms(updated);
      showToast(`Payment term updated`);
    } else {
      const newTerm: PaymentTerm = {
        id: `term-${Date.now()}`,
        name: termName.trim(),
        days: Number(termDays) || 0,
        description: termDescription.trim(),
        isDefault: termIsDefault,
        isActive: true,
      };
      const updated = paymentTerms.map((t) =>
        termIsDefault ? { ...t, isDefault: false } : t
      );
      const all = [...updated, newTerm];
      setPaymentTerms(all);
      saveStoredPaymentTerms(all);
      showToast(`Payment term created`);
    }
    setIsTermModalOpen(false);
  };

  const handleSetDefaultTerm = (termId: string) => {
    const updated = paymentTerms.map((t) => ({
      ...t,
      isDefault: t.id === termId,
    }));
    setPaymentTerms(updated);
    saveStoredPaymentTerms(updated);
    showToast(`Default payment term updated`);
  };

  const handleDeleteTerm = (termId: string) => {
    const target = paymentTerms.find((t) => t.id === termId);
    if (!target) return;
    if (target.isDefault) {
      alert("Cannot delete the active default payment term.");
      return;
    }
    if (confirm(`Delete "${target.name}"?`)) {
      const updated = paymentTerms.filter((t) => t.id !== termId);
      setPaymentTerms(updated);
      saveStoredPaymentTerms(updated);
      showToast(`Term deleted`);
    }
  };

  // Logo File Reader
  const processLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, SVG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const updated = { ...profile, logoUrl: base64 };
        setProfile(updated);
        saveStoredCompanyProfile(updated);
        showToast("Company logo updated successfully");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleResetLogo = () => {
    const updated = { ...profile, logoUrl: "/logo.png" };
    setProfile(updated);
    saveStoredCompanyProfile(updated);
    showToast("Logo reset to default");
  };

  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredCompanyProfile(profile);

    const updatedTax = {
      ...taxSettings,
      ein: profile.ein,
    };
    setTaxSettings(updatedTax);
    saveStoredTaxSettings(updatedTax);

    showToast("Company profile saved successfully");
  };

  // Math
  const curRate = taxSettings.defaultTaxRate;
  const isExclusive = taxSettings.taxCalculationMode === "EXCLUSIVE";
  const simTax = isExclusive
    ? (testAmount * curRate) / 100
    : testAmount - testAmount / (1 + curRate / 100);
  const simBase = isExclusive ? testAmount : testAmount / (1 + curRate / 100);
  const simTotal = isExclusive ? testAmount + simTax : testAmount;

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-light)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              Settings & Business Policies
            </h1>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-700">
              US Edition (USD)
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Configure sales tax rates, company letterhead & logo, and payment terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/invoices"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--foreground)] shadow-2xs transition hover:bg-[var(--muted-background)]"
          >
            <span>Open Invoices</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Tab Switcher (Sleek Pro Style) */}
      <div className="flex border-b border-[var(--border)] text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("tax")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === "tax"
              ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-slate-800"
          }`}
        >
          <Percent size={14} />
          <span>Sales Tax & Slabs</span>
          <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-2xs font-bold text-emerald-800 font-mono">
            {taxSettings.defaultTaxRate}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === "company"
              ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-slate-800"
          }`}
        >
          <Building2 size={14} />
          <span>Company Profile & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payment")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === "payment"
              ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-slate-800"
          }`}
        >
          <CreditCard size={14} />
          <span>Payment Terms</span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-2xs font-semibold text-slate-600 font-mono">
            {paymentTerms.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SALES TAX & SLABS                                  */}
      {/* ========================================================= */}
      {activeTab === "tax" && (
        <div className="space-y-4">
          {/* Top 4 KPI Cards (Reports Style) */}
          <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
            <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Active Tax Rate
                </span>
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  Applied
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 font-mono">
                {taxSettings.defaultTaxRate}%
              </p>
              <p className="text-xs text-[var(--muted)] truncate">
                {taxSettings.defaultTaxName}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Calculation Mode
                </span>
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
                  {taxSettings.taxCalculationMode}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {taxSettings.taxCalculationMode === "EXCLUSIVE"
                  ? "Tax Exclusive"
                  : "Tax Inclusive"}
              </p>
              <p className="text-xs text-[var(--muted)] truncate">
                {taxSettings.taxCalculationMode === "EXCLUSIVE"
                  ? "Price + Sales Tax added"
                  : "Tax embedded inside price"}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Federal EIN
                </span>
                <span className="text-slate-400 font-mono text-xs">IRS ID</span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-900 font-mono">
                {profile.ein || "84-2910394"}
              </p>
              <p className="text-xs text-[var(--muted)] truncate">
                Sundara Furnishings LLC
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Configured Slabs
                </span>
                <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-xs font-bold text-purple-800 border border-purple-200">
                  {taxSettings.slabs.length} Tiers
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {taxSettings.slabs.length} Defined Slabs
              </p>
              <p className="text-xs text-[var(--muted)] truncate">
                Retail, Wholesale & Exempt
              </p>
            </div>
          </div>

          {/* Manual Rate Configuration + Simulator */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Left 2 Cols: Manual Rate Configuration */}
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs space-y-3.5 lg:col-span-2">
              <div className="border-b border-[var(--border-light)] pb-2.5">
                <h2 className="text-sm font-bold text-slate-900">
                  System Default Sales Tax Rate
                </h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Enter any custom percentage manually or select a preset. Automatically populates on new invoices.
                </p>
              </div>

              {/* Direct Manual Input */}
              <form onSubmit={handleApplyManualRate} className="space-y-2">
                <label className="text-xs font-semibold text-slate-800">
                  Custom Tax Percentage (%):
                </label>
                <div className="flex items-center gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={manualRateInput}
                      onChange={(e) => setManualRateInput(e.target.value)}
                      placeholder="e.g. 8.25"
                      className="form-input text-xs font-mono font-bold pr-8 h-8 py-1 px-3"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 text-xs font-semibold text-white! shadow-xs transition hover:bg-[var(--primary-dark)] active:scale-95 shrink-0"
                  >
                    <Save size={13} />
                    <span>Apply & Save</span>
                  </button>
                </div>
              </form>

              {/* Quick Preset Pills */}
              <div className="pt-1">
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Quick US Presets:
                </span>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {[
                    { label: "8.25% (NC Combined)", rate: 8.25 },
                    { label: "7.00% (Flat)", rate: 7.0 },
                    { label: "4.75% (State Only)", rate: 4.75 },
                    { label: "0.00% (Exempt)", rate: 0 },
                  ].map((preset) => {
                    const isCurrent = taxSettings.defaultTaxRate === preset.rate;
                    return (
                      <button
                        key={preset.rate}
                        type="button"
                        onClick={() => {
                          setManualRateInput(String(preset.rate));
                          const updatedSlabs = taxSettings.slabs.map((s) => ({
                            ...s,
                            isDefault: s.rate === preset.rate,
                          }));
                          const updated: TaxSettingsConfig = {
                            ...taxSettings,
                            defaultTaxRate: preset.rate,
                            defaultTaxName: preset.label,
                            slabs: updatedSlabs,
                          };
                          setTaxSettings(updated);
                          saveStoredTaxSettings(updated);
                          showToast(`Set default tax to ${preset.rate}%`);
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-xs! transition ${
                          isCurrent
                            ? "border-[var(--primary)] bg-emerald-50 text-[var(--primary)] font-bold shadow-2xs"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="pt-2 border-t border-[var(--border-light)]">
                <span className="text-xs font-semibold text-slate-800">
                  Tax Calculation Mode:
                </span>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleMode("EXCLUSIVE")}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                      taxSettings.taxCalculationMode === "EXCLUSIVE"
                        ? "border-[var(--primary)] bg-emerald-50/40 shadow-2xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                        taxSettings.taxCalculationMode === "EXCLUSIVE"
                          ? "border-[var(--primary)] bg-[var(--primary)]"
                          : "border-slate-400"
                      }`}
                    >
                      {taxSettings.taxCalculationMode === "EXCLUSIVE" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        Tax Exclusive (Standard US)
                      </p>
                      <p className="mt-0.5 text-2xs text-slate-600">
                        Added on top of price: <code>$1,000 + 8.25% ($82.50) = $1,082.50</code>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleMode("INCLUSIVE")}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                      taxSettings.taxCalculationMode === "INCLUSIVE"
                        ? "border-[var(--primary)] bg-emerald-50/40 shadow-2xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                        taxSettings.taxCalculationMode === "INCLUSIVE"
                          ? "border-[var(--primary)] bg-[var(--primary)]"
                          : "border-slate-400"
                      }`}
                    >
                      {taxSettings.taxCalculationMode === "INCLUSIVE" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        Tax Inclusive (Retail)
                      </p>
                      <p className="mt-0.5 text-2xs text-slate-600">
                        Price includes tax: <code>Customer pays $1,000 total</code>
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Test Calculator */}
            <div className="rounded-xl border border-emerald-200 bg-linear-to-b from-emerald-50/40 to-white p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                  <Calculator size={14} />
                  <span>US Sales Tax Simulator</span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  Live calculation test using active parameters:
                </p>

                <div className="mt-3">
                  <label className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                    Sample Order Amount ($):
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={testAmount}
                      onChange={(e) =>
                        setTestAmount(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="form-input !pl-6 text-xs font-mono font-bold h-8 py-1 px-3"
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 rounded-lg border border-emerald-100 bg-white p-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Base:</span>
                    <span className="font-mono">${simBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Sales Tax ({curRate}%):</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      +${simTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold text-slate-900 text-xs">
                    <span>Total Amount:</span>
                    <span className="font-mono text-[var(--primary)] font-extrabold">
                      ${simTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-200">
                ✓ Ready: Newly created invoices will default to{" "}
                <strong className="text-slate-800">{curRate}%</strong>.
              </div>
            </div>
          </div>

          {/* Slabs Management Table (Clean Reports Style) */}
          <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Configured Tax Slabs
                </h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Standard categories available on product and invoice forms.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddSlab}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 text-xs font-semibold text-white! shadow-xs transition hover:bg-[var(--primary-dark)]"
              >
                <Plus size={14} />
                <span>Add Slab</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border)] bg-[var(--muted-background)]/50 text-2xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-3">SLAB NAME</th>
                    <th className="px-5 py-3">RATE (%)</th>
                    <th className="px-5 py-3">TAX CODE</th>
                    <th className="px-5 py-3">DESCRIPTION</th>
                    <th className="px-5 py-3">STATUS</th>
                    <th className="px-5 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)] text-xs">
                  {taxSettings.slabs.map((slab) => {
                    const isDefault = slab.isDefault;
                    return (
                      <tr
                        key={slab.id}
                        className={`transition hover:bg-slate-50/70 ${
                          isDefault ? "bg-emerald-50/25" : ""
                        }`}
                      >
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{slab.name}</span>
                            {isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-2xs font-bold text-emerald-800">
                                <Star size={9} className="fill-emerald-800" /> Default
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3 font-mono font-bold text-slate-800 text-xs">
                          {slab.rate}%
                        </td>

                        <td className="px-5 py-3 font-mono text-slate-600 text-2xs">
                          {slab.taxCode || "US-TAX"}
                        </td>

                        <td className="px-5 py-3 text-slate-600 text-xs max-w-sm truncate">
                          {slab.description}
                        </td>

                        <td className="px-5 py-3">
                          {isDefault ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <Check size={13} /> Active Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultSlab(slab.id)}
                              className="text-xs font-medium text-slate-500 hover:text-[var(--primary)] hover:underline"
                            >
                              Set Default
                            </button>
                          )}
                        </td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSlab(slab)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              title="Edit Slab"
                            >
                              <Edit2 size={13} />
                            </button>
                            {!isDefault && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSlab(slab.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                title="Delete Slab"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: COMPANY PROFILE & LOGO (DRAG-AND-DROP REPLACE)    */}
      {/* ========================================================= */}
      {activeTab === "company" && (
        <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-4">
            <div className="border-b border-[var(--border-light)] pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Company Details & Invoice Letterhead
              </h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Essential business coordinates that print on customer invoices and quotations.
              </p>
            </div>

            {/* Card Drag & Drop Logo Zone */}
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                Company Logo
              </label>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(true);
                }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={handleLogoDrop}
                onClick={() => logoInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 cursor-pointer transition ${
                  isDraggingLogo
                    ? "border-sky-400 bg-sky-50/60 scale-[1.01]"
                    : "border-sky-200 bg-sky-50/20 hover:border-sky-400 hover:bg-sky-50/40"
                }`}
                title="Click or Drag & Drop"
              >
                {profile.logoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={profile.logoUrl}
                      alt="Company Logo Preview"
                      className="max-h-16 max-w-[220px] object-contain drop-shadow-2xs"
                    />
                    <div className="flex items-center gap-1.5 text-sky-600 mt-1">
                      <UploadCloud size={16} />
                      <span className="text-xs font-semibold">Click or Drag & Drop to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-500 mb-2">
                      <UploadCloud size={26} />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      Send your logo here
                    </p>
                    <p className="text-2xs text-slate-400 mt-0.5">
                      Click or Drag & Drop
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Only Essential Details (Clean & Pro) */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 text-xs pt-1">
              <div>
                <label className="font-semibold text-slate-800 text-xs">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="form-input mt-1 h-8 text-xs py-1 px-3"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 text-xs">
                  Federal Tax ID / EIN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 84-2910394"
                  value={profile.ein}
                  onChange={(e) => setProfile({ ...profile, ein: e.target.value })}
                  className="form-input mt-1 h-8 text-xs font-mono py-1 px-3"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-800 text-xs">
                  Office / Showroom Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4820 South Blvd, Charlotte, NC 28217"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="form-input mt-1 h-8 text-xs py-1 px-3"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 text-xs">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +1 (704) 555-0199"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="form-input mt-1 h-8 text-xs py-1 px-3"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 text-xs">
                  Billing Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. billing@sundarafurnishings.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="form-input mt-1 h-8 text-xs py-1 px-3"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-[var(--border-light)]">
              <button
                type="submit"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 text-xs font-semibold text-white! shadow-xs transition hover:bg-[var(--primary-dark)]"
              >
                <Save size={13} />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAYMENT & CREDIT TERMS                             */}
      {/* ========================================================= */}
      {activeTab === "payment" && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Payment & Credit Terms
                </h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Standard settlement schedules available when issuing customer invoices.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddTerm}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 text-xs font-semibold text-white! shadow-xs transition hover:bg-[var(--primary-dark)]"
              >
                <Plus size={14} />
                <span>Add Term</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border)] bg-[var(--muted-background)]/50 text-2xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-3">TERM NAME</th>
                    <th className="px-5 py-3">WINDOW</th>
                    <th className="px-5 py-3">DESCRIPTION</th>
                    <th className="px-5 py-3">STATUS</th>
                    <th className="px-5 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)] text-xs">
                  {paymentTerms.map((term) => {
                    const isDefault = term.isDefault;
                    return (
                      <tr
                        key={term.id}
                        className={`transition hover:bg-slate-50/70 ${
                          isDefault ? "bg-emerald-50/25" : ""
                        }`}
                      >
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{term.name}</span>
                            {isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-2xs font-bold text-emerald-800">
                                <Star size={9} className="fill-emerald-800" /> Default
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3 font-mono font-semibold text-slate-800 text-xs">
                          {term.days === 0 ? "Immediate" : `${term.days} Days`}
                        </td>

                        <td className="px-5 py-3 text-slate-600 text-xs max-w-sm truncate">
                          {term.description}
                        </td>

                        <td className="px-5 py-3">
                          {isDefault ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <Check size={13} /> Active Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultTerm(term.id)}
                              className="text-xs font-medium text-slate-500 hover:text-[var(--primary)] hover:underline"
                            >
                              Set Default
                            </button>
                          )}
                        </td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditTerm(term)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              title="Edit Term"
                            >
                              <Edit2 size={13} />
                            </button>
                            {!isDefault && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTerm(term.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                title="Delete Term"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* MODAL: ADD / EDIT TAX SLAB */}
      {isSlabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSlab ? "Edit Tax Slab" : "Add Tax Slab"}
              </h3>
              <button
                type="button"
                onClick={() => setIsSlabModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSlab} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-800">
                  Slab Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard NC Sales Tax (8.25%)"
                  value={slabName}
                  onChange={(e) => setSlabName(e.target.value)}
                  className="form-input mt-1 h-8 text-xs py-1 px-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-800">
                    Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="8.25"
                    value={slabRate}
                    onChange={(e) => setSlabRate(parseFloat(e.target.value) || 0)}
                    className="form-input mt-1 h-8 text-xs font-mono font-bold py-1 px-3"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800">Tax Code</label>
                  <input
                    type="text"
                    placeholder="e.g. US-TAX"
                    value={slabCode}
                    onChange={(e) => setSlabCode(e.target.value)}
                    className="form-input mt-1 h-8 text-xs font-mono uppercase py-1 px-3"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800">
                  Description / Applicability
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard furniture & accessories"
                  value={slabDescription}
                  onChange={(e) => setSlabDescription(e.target.value)}
                  className="form-input mt-1 h-8 text-xs py-1 px-3"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalSlabDefault"
                  checked={slabIsDefault}
                  onChange={(e) => setSlabIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <label
                  htmlFor="modalSlabDefault"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Set as system default rate
                </label>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-[var(--border-light)] pt-3">
                <button
                  type="button"
                  onClick={() => setIsSlabModalOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white! shadow-xs hover:bg-[var(--primary-dark)]"
                >
                  {editingSlab ? "Update Slab" : "Create Slab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PAYMENT TERM */}
      {isTermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[var(--border-light)] pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTerm ? "Edit Payment Term" : "Add Payment Term"}
              </h3>
              <button
                type="button"
                onClick={() => setIsTermModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTerm} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-800">
                  Term Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Net 30, Net 45"
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  className="form-input mt-1 h-8 text-xs py-1 px-3"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800">
                  Payment Window (Days) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="365"
                  placeholder="30"
                  value={termDays}
                  onChange={(e) => setTermDays(parseInt(e.target.value, 10) || 0)}
                  className="form-input mt-1 h-8 text-xs font-mono font-bold py-1 px-3"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full invoice balance payable within 30 days"
                  value={termDescription}
                  onChange={(e) => setTermDescription(e.target.value)}
                  className="form-input mt-1 h-8 text-xs py-1 px-3"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalTermDefault"
                  checked={termIsDefault}
                  onChange={(e) => setTermIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <label
                  htmlFor="modalTermDefault"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Set as default for new invoices
                </label>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-[var(--border-light)] pt-3">
                <button
                  type="button"
                  onClick={() => setIsTermModalOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white! shadow-xs hover:bg-[var(--primary-dark)]"
                >
                  {editingTerm ? "Update Term" : "Create Term"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
