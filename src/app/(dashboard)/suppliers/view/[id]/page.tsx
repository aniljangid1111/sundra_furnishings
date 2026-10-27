import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import { suppliers } from "@/features/suppliers/supplier.data";

interface SupplierViewPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(dateStr: string) {
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

export default async function SupplierViewPage({
  params,
}: SupplierViewPageProps) {
  const { id } = await params;

  const supplier = suppliers.find((item) => item.id === Number(id));

  if (!supplier) {
    notFound();
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

        <Link
          href={`/suppliers/edit/${supplier.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
        >
          <Pencil size={16} />
          Edit Supplier
        </Link>
      </div>

      {/* Identity Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
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
            <span className="rounded-lg bg-[var(--muted-background)] px-3 py-1.5 font-medium text-[var(--foreground)]">
              Terms: {supplier.paymentTerms}
            </span>
            <span className="rounded-lg bg-[var(--muted-background)] px-3 py-1.5 font-medium text-[var(--foreground)]">
              Facility: {supplier.city}, {supplier.state}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 spans) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Supplier & Contact Info */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-4 flex items-center gap-2.5 border-b border-[var(--border-light)] pb-3">
              <Users size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Supplier Information</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Supplier Type
                </p>
                <p className="mt-1 text-sm font-medium">
                  {isBusiness ? "Business / Corporation" : "Individual Artisan"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Primary Contact Person
                </p>
                <p className="mt-1 text-sm font-medium">
                  {supplier.contactPerson}
                </p>
              </div>

              {isBusiness && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Company Name
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {supplier.companyName}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Email Address
                </p>
                {supplier.email ? (
                  <a
                    href={`mailto:${supplier.email}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    <Mail size={14} />
                    {supplier.email}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-[var(--muted)]">Not provided</p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Primary Phone
                </p>
                {supplier.phone ? (
                  <a
                    href={`tel:${supplier.phone}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                  >
                    <Phone size={14} />
                    {supplier.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-[var(--muted)]">Not provided</p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Alternate Phone
                </p>
                <p className="mt-1 text-sm font-medium">
                  {supplier.alternatePhone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Tax ID / EIN
                </p>
                <p className="mt-1 text-sm font-medium">
                  {supplier.taxId || "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Address Card */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
              <MapPin size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Facility & Dispatch Address</h2>
            </div>
            <div className="space-y-1 text-sm text-[var(--foreground)]">
              <p className="font-medium">{supplier.addressLine1}</p>
              {supplier.addressLine2 && <p>{supplier.addressLine2}</p>}
              <p>
                {supplier.city}, {supplier.state} {supplier.postalCode}
              </p>
              <p className="text-xs text-[var(--muted)]">{supplier.country}</p>
            </div>
          </section>

          {/* Purchasing Notes */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
              <FileText size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Purchasing Notes</h2>
            </div>
            {supplier.notes ? (
              <p className="text-sm leading-relaxed text-[var(--foreground)]">
                {supplier.notes}
              </p>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No purchasing notes recorded for this vendor.
              </p>
            )}
          </section>

          {/* Purchase History Section */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border-light)] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-[var(--primary)]" />
                <h2 className="font-semibold">Purchase History</h2>
              </div>
              <Link
                href="/purchases/new"
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                + New Purchase Order
              </Link>
            </div>

            <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center">
              <ShoppingCart
                size={28}
                className="mx-auto mb-2 text-[var(--muted)]"
              />
              <p className="text-sm font-medium text-[var(--foreground)]">
                Purchase Orders Linked to {displayName}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Purchase orders created for this supplier will appear here with line items and status tracking.
              </p>
              <div className="mt-4">
                <Link
                  href="/purchases"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted-background)]"
                >
                  View All Purchases
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-6">
          {/* Payment & Account Terms */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
              <CreditCard size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Payment Terms</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Payment Terms</span>
                <span className="font-medium text-[var(--foreground)]">
                  {supplier.paymentTerms}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Opening Balance</span>
                <span className="font-semibold text-[var(--foreground)]">
                  ${(supplier.openingBalance || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Status</span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isActive
                      ? "bg-emerald-50 text-[var(--success)]"
                      : "bg-gray-100 text-[var(--muted)]"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border-light)] pt-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <Calendar size={13} /> Registered
                </span>
                <span className="text-xs text-[var(--foreground)]">
                  {formatDate(supplier.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <Calendar size={13} /> Last Updated
                </span>
                <span className="text-xs text-[var(--foreground)]">
                  {formatDate(supplier.updatedAt)}
                </span>
              </div>
            </div>
          </section>

          {/* Quick Back */}
          <div className="pt-2">
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <ArrowLeft size={16} />
              Back to Suppliers List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
