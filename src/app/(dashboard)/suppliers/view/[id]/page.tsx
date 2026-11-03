"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
} from "lucide-react";

import { getSupplierByIdApi } from "@/lib/api/supplier.api";
import { PermissionGate } from "@/lib/auth/permissions";
import type { Supplier } from "@/features/suppliers/supplier.types";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function SupplierViewPage() {
  const params = useParams();
  const id = params?.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    setError(null);

    getSupplierByIdApi(id)
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setSupplier(res.data);
        } else {
          setError(res.message || "Supplier not found");
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err.message || "Failed to load supplier details");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
          <p className="text-sm font-medium">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Supplier Not Found
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {error || "The supplier you are looking for does not exist."}
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/suppliers"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-xs font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <ArrowLeft size={14} /> Back to Suppliers
          </Link>
        </div>
      </div>
    );
  }

  const isBusiness = supplier.supplierType === "BUSINESS";
  const isActive = supplier.status === "ACTIVE";
  const displayName = supplier.companyName || supplier.contactPerson;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/suppliers"
            aria-label="Back to suppliers"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {displayName}
              </h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  isActive
                    ? "bg-emerald-50 text-[var(--success)]"
                    : "bg-gray-100 text-[var(--muted)]"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Supplier Code:{" "}
              <span className="font-mono font-medium text-[var(--foreground)]">
                {supplier.supplierCode}
              </span>
            </p>
          </div>
        </div>

        <PermissionGate module="suppliers" action="edit">
          <Link
            href={`/suppliers/edit/${supplier.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)]"
          >
            <Pencil size={16} />
            Edit Supplier
          </Link>
        </PermissionGate>
      </div>

      {/* Identity Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              isBusiness
                ? "bg-blue-50 text-blue-700"
                : "bg-[var(--primary-light)] text-[var(--primary)]"
            }`}
          >
            {isBusiness ? <Building2 size={26} /> : <User size={26} />}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold">{displayName}</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {isBusiness
                ? `Commercial Vendor • Contact: ${supplier.contactPerson}`
                : "Independent Artisan / Individual Supplier"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="rounded-xl bg-[var(--muted-background)] px-3 py-2 text-center">
              <p className="text-[10px] uppercase text-[var(--muted)]">Payment Terms</p>
              <p className="font-semibold text-[var(--foreground)]">
                {supplier.paymentTerms}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--muted-background)] px-3 py-2 text-center">
              <p className="text-[10px] uppercase text-[var(--muted)]">Opening Balance</p>
              <p className="font-semibold text-[var(--primary)]">
                ${Number(supplier.openingBalance || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact details */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Mail size={16} className="text-[var(--primary)]" /> Contact Information
          </h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-[var(--muted)]">Primary Contact</p>
              <p className="font-medium text-[var(--foreground)]">{supplier.contactPerson}</p>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)]">Email Address</p>
              <p className="font-medium text-[var(--foreground)]">{supplier.email}</p>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)]">Phone Number</p>
              <p className="font-medium text-[var(--foreground)]">{supplier.phone}</p>
            </div>

            {supplier.alternatePhone && (
              <div>
                <p className="text-xs text-[var(--muted)]">Alternate Phone</p>
                <p className="font-medium text-[var(--foreground)]">{supplier.alternatePhone}</p>
              </div>
            )}

            {supplier.taxId && (
              <div>
                <p className="text-xs text-[var(--muted)]">Tax ID / EIN</p>
                <p className="font-medium font-mono text-[var(--foreground)]">{supplier.taxId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Address details */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <MapPin size={16} className="text-[var(--primary)]" /> Facility & Mailing Address
          </h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-[var(--muted)]">Street Address</p>
              <p className="font-medium text-[var(--foreground)]">{supplier.addressLine1}</p>
              {supplier.addressLine2 && (
                <p className="text-xs text-[var(--muted)]">{supplier.addressLine2}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-[var(--muted)]">City</p>
                <p className="font-medium text-[var(--foreground)]">{supplier.city}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">State / Province</p>
                <p className="font-medium text-[var(--foreground)]">{supplier.state}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-[var(--muted)]">Postal Code</p>
                <p className="font-medium text-[var(--foreground)]">{supplier.postalCode}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Country</p>
                <p className="font-medium text-[var(--foreground)]">{supplier.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {supplier.notes && (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <FileText size={16} className="text-[var(--primary)]" /> Procurement Notes
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            {supplier.notes}
          </p>
        </div>
      )}

      <div>
        <Link
          href="/suppliers"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Back to Suppliers
        </Link>
      </div>
    </div>
  );
}
