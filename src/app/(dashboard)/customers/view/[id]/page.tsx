import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  Truck,
  User,
  Users,
} from "lucide-react";
import { customers } from "@/features/customers/customer.data";
import type { Address } from "@/features/customers/customer.types";

interface CustomerViewPageProps {
  params: Promise<{ id: string }>;
}

function formatAddress(address: Address) {
  return (
    <div className="space-y-1 text-sm text-[var(--foreground)]">
      <p className="font-medium">{address.addressLine1}</p>
      {address.addressLine2 && <p>{address.addressLine2}</p>}
      <p>
        {address.city}, {address.state} {address.postalCode}
      </p>
      <p className="text-xs text-[var(--muted)]">{address.country}</p>
    </div>
  );
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

export default async function CustomerViewPage({
  params,
}: CustomerViewPageProps) {
  const { id } = await params;

  const customer = customers.find((item) => item.id === Number(id));

  if (!customer) {
    notFound();
  }

  const isBusiness = customer.customerType === "BUSINESS";
  const isActive = customer.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/customers"
            aria-label="Back to customers"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {customer.displayName}
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
              Customer code:{" "}
              <span className="font-mono font-medium text-[var(--foreground)]">
                {customer.customerCode}
              </span>
            </p>
          </div>
        </div>

        <Link
          href={`/customers/edit/${customer.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
        >
          <Pencil size={16} />
          Edit Customer
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
            <h2 className="text-lg font-semibold">{customer.displayName}</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {isBusiness ? (
                <>Business Account • {customer.companyName}</>
              ) : (
                <>Individual Customer</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-lg bg-[var(--muted-background)] px-3 py-1.5 font-medium text-[var(--foreground)]">
              Terms: {customer.paymentTerms}
            </span>
            <span className="rounded-lg bg-[var(--muted-background)] px-3 py-1.5 font-medium text-[var(--foreground)]">
              Credit Limit: ${customer.creditLimit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 spans) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Information */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-4 flex items-center gap-2.5 border-b border-[var(--border-light)] pb-3">
              <Users size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Customer Information</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Customer Type
                </p>
                <p className="mt-1 text-sm font-medium">
                  {isBusiness ? "Business" : "Individual"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Contact Name
                </p>
                <p className="mt-1 text-sm font-medium">
                  {customer.firstName} {customer.lastName}
                </p>
              </div>

              {isBusiness && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Company Name
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {customer.companyName || "—"}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Email Address
                </p>
                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    <Mail size={14} />
                    {customer.email}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-[var(--muted)]">Not provided</p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Primary Phone
                </p>
                {customer.phone ? (
                  <a
                    href={`tel:${customer.phone}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                  >
                    <Phone size={14} />
                    {customer.phone}
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
                  {customer.alternatePhone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Tax ID / EIN
                </p>
                <p className="mt-1 text-sm font-medium">
                  {customer.taxId || "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Addresses Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Billing Address */}
            <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <div className="mb-4 flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
                <MapPin size={18} className="text-[var(--primary)]" />
                <h2 className="font-semibold">Billing Address</h2>
              </div>
              {formatAddress(customer.billingAddress)}
            </section>

            {/* Shipping Address */}
            <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <div className="mb-4 flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
                <Truck size={18} className="text-[var(--primary)]" />
                <h2 className="font-semibold">Shipping Address</h2>
              </div>
              {formatAddress(customer.shippingAddress)}
            </section>
          </div>

          {/* Notes Section */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
              <FileText size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Internal Notes</h2>
            </div>
            {customer.notes ? (
              <p className="text-sm leading-relaxed text-[var(--foreground)]">
                {customer.notes}
              </p>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No internal notes recorded for this customer.
              </p>
            )}
          </section>
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-6">
          {/* Payment & Account Details */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
              <CreditCard size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Account Terms</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Payment Terms</span>
                <span className="font-medium text-[var(--foreground)]">
                  {customer.paymentTerms}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Credit Limit</span>
                <span className="font-semibold text-[var(--foreground)]">
                  ${customer.creditLimit.toLocaleString("en-US", {
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
                  <Calendar size={13} /> Created
                </span>
                <span className="text-xs text-[var(--foreground)]">
                  {formatDate(customer.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <Calendar size={13} /> Last Updated
                </span>
                <span className="text-xs text-[var(--foreground)]">
                  {formatDate(customer.updatedAt)}
                </span>
              </div>
            </div>
          </section>

          {/* Placeholders for Future Invoicing/Sales Integration */}
          <section className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-6">
            <div className="mb-3 flex items-center gap-2 text-[var(--muted)]">
              <Receipt size={17} />
              <h3 className="text-sm font-semibold">Outstanding Balance</h3>
            </div>
            <p className="text-xs leading-5 text-[var(--muted)]">
              Not available yet. Balance tracking will be enabled upon billing and
              invoice module integration.
            </p>
          </section>

          <section className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-6">
            <div className="mb-3 flex items-center gap-2 text-[var(--muted)]">
              <History size={17} />
              <h3 className="text-sm font-semibold">Sales History</h3>
            </div>
            <p className="text-xs leading-5 text-[var(--muted)]">
              Not available yet. Order history and fulfilled shipments will
              appear once sales channels and quotations are linked.
            </p>
          </section>

          {/* Quick Back Link */}
          <div className="pt-2">
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <ArrowLeft size={16} />
              Back to Customers List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
