"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Download,
  Edit3,
  FileText,
  Loader2,
  MapPin,
  Warehouse,
} from "lucide-react";
import { initialInvoices } from "@/features/invoices/invoice.data";
import { downloadInvoicePdf } from "@/lib/pdf-export";

interface ViewInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function ViewInvoicePage({ params }: ViewInvoicePageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-[var(--muted)]">
          Loading invoice details...
        </div>
      }
    >
      <ViewInvoiceContent params={params} />
    </Suspense>
  );
}

function ViewInvoiceContent({ params }: ViewInvoicePageProps) {
  const { id } = use(params);
  const [isDownloading, setIsDownloading] = useState(false);

  const invoice = initialInvoices.find(
    (item) =>
      item.id === Number(id) ||
      item.invoiceNumber.toLowerCase() === id.toLowerCase(),
  );

  if (!invoice) {
    notFound();
  }

  // Direct 1-Click PDF Download (Pure jsPDF - No print dialog)
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(invoice);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ISSUED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "DRAFT":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "PARTIALLY_PAID":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "OVERDUE":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* Top Header - Back button ONLY at top next to title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/invoices"
            aria-label="Back to invoices"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                {invoice.invoiceNumber}
              </h1>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                  invoice.status,
                )}`}
              >
                {invoice.status}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPaymentBadge(
                  invoice.paymentStatus,
                )}`}
              >
                Payment: {invoice.paymentStatus.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Customer:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {invoice.buyerName}
              </span>
              {invoice.salesChannelName && ` • Channel: ${invoice.salesChannelName}`}
              {invoice.warehouseName && ` • Origin: ${invoice.warehouseName.split("(")[0]}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/invoices/edit/${invoice.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted-background)]"
          >
            <Edit3 size={15} />
            <span>Edit Invoice</span>
          </Link>

          {/* Direct 1-Click PDF Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download Invoice PDF directly"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)] active:scale-95 disabled:opacity-75"
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overview Meta Cards - Spacious Horizontal Design */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Building2 size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                BUYER / CUSTOMER
              </p>
              <p className="mt-0.5 text-sm font-bold text-[var(--foreground)] truncate">
                {invoice.buyerName}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
                {invoice.salesChannelName}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Calendar size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                INVOICE & DUE DATE
              </p>
              <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                {invoice.invoiceDate}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Due: {invoice.dueDate}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Warehouse size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                ORIGIN FACILITY
              </p>
              <p className="mt-0.5 text-sm font-bold text-[var(--foreground)] truncate">
                {invoice.warehouseName}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
                Fulfillment Location
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                GRAND TOTAL
              </p>
              <p className="mt-0.5 text-base font-extrabold text-[var(--primary)] truncate">
                $
                {invoice.grandTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p
                className={`text-xs font-semibold mt-0.5 truncate ${invoice.balanceDue > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                  }`}
              >
                Balance: ${invoice.balanceDue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Line Items Table Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border-light)] px-6 py-4">
          <h2 className="font-semibold text-base">Invoiced Items</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Line items, quantities, and sales pricing for this order.
          </p>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[var(--border-light)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="pb-3 font-medium">Product / SKU</th>
                <th className="pb-3 text-center font-medium w-24">Qty</th>
                <th className="pb-3 text-right font-medium w-32">Unit Price</th>
                <th className="pb-3 text-right font-medium w-28">Discount</th>
                <th className="pb-3 text-right font-medium w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-[var(--foreground)]">
                      {item.productName}
                    </p>
                    <p className="font-mono text-xs text-[var(--muted)] mt-0.5">
                      {item.sku}
                    </p>
                  </td>
                  <td className="py-3.5 text-center font-semibold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right font-mono">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-right font-mono text-emerald-700">
                    {item.discount > 0 ? `-$${item.discount.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-3.5 text-right font-semibold font-mono">
                    $
                    {item.lineTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown */}
        <div className="border-t border-[var(--border-light)] bg-[var(--muted-background)]/40 p-6">
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-[var(--muted)]">
              <span>Subtotal</span>
              <span className="font-medium text-[var(--foreground)] font-mono">
                ${invoice.subtotal.toFixed(2)}
              </span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discounts</span>
                <span className="font-mono">-${invoice.discountTotal.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxTotal > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Sales Tax</span>
                <span className="font-mono">${invoice.taxTotal.toFixed(2)}</span>
              </div>
            )}
            {invoice.shippingCharges > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Shipping & Delivery</span>
                <span className="font-mono">${invoice.shippingCharges.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-bold">
              <span>Grand Total</span>
              <span className="text-[var(--primary)] font-mono">
                ${invoice.grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--border-light)] pt-2 text-xs">
              <span className="text-[var(--muted)]">Amount Paid</span>
              <span className="font-medium font-mono">${invoice.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[var(--muted)]">Balance Due</span>
              <span
                className={`font-mono ${invoice.balanceDue > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                  }`}
              >
                ${invoice.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Address & Terms Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold text-sm">Billing & Delivery Addresses</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-slate-700">Billing Address</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {invoice.billingAddress || "Standard Account Billing"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Shipping Address</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {invoice.shippingAddress || invoice.billingAddress || "Storefront / Curbside Delivery"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold text-sm">Payment Terms & Notes</h2>
          </div>
          <p className="text-xs leading-relaxed text-[var(--foreground)]">
            {invoice.termsAndConditions ||
              "Payment is due within 30 days of invoice date. Wire transfer or ACH accepted."}
          </p>
          {invoice.notes && (
            <p className="text-xs text-[var(--muted)] border-t border-slate-100 pt-2">
              Note: {invoice.notes}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
