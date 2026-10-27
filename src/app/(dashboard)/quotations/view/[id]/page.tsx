import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileCheck,
  FileText,
  Mail,
  Package,
  Pencil,
  Phone,
  Store,
  User,
} from "lucide-react";
import { quotations } from "@/features/quotations/quotation.data";

interface QuotationViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotationViewPage({
  params,
}: QuotationViewPageProps) {
  const { id } = await params;

  const quote = quotations.find((q) => q.id === Number(id));

  if (!quote) {
    notFound();
  }

  const isConverted = quote.status === "CONVERTED";
  const isExpired = quote.status === "EXPIRED";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/quotations"
            aria-label="Back to quotations"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {quote.quotationNumber}
              </h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  isConverted
                    ? "bg-purple-50 text-purple-700"
                    : quote.status === "ACCEPTED"
                    ? "bg-emerald-50 text-[var(--success)]"
                    : quote.status === "SENT"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-[var(--muted)]"
                }`}
              >
                {quote.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Buyer: <span className="font-medium text-[var(--foreground)]">{quote.buyerName}</span>
              {quote.salesChannelName && ` • Channel: ${quote.salesChannelName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConverted && !isExpired && (
            <Link
              href={`/quotations/edit/${quote.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium hover:bg-[var(--muted-background)]"
            >
              <Pencil size={16} />
              Edit Quote
            </Link>
          )}

          {!isConverted && (
            <Link
              href="/invoices/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
            >
              <FileCheck size={16} />
              Convert to Invoice
            </Link>
          )}

          {isConverted && quote.convertedInvoiceNumber && (
            <Link
              href="/invoices"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 px-4 text-sm font-medium hover:bg-purple-100"
            >
              <FileCheck size={16} />
              View Invoice ({quote.convertedInvoiceNumber})
            </Link>
          )}
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Buyer / Client</p>
          <p className="mt-1 text-base font-semibold">{quote.buyerName}</p>
          <div className="mt-2 space-y-0.5 text-xs text-[var(--muted)]">
            {quote.buyerEmail && <p>{quote.buyerEmail}</p>}
            {quote.buyerPhone && <p>{quote.buyerPhone}</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Validity Period</p>
          <p className="mt-1 text-sm font-semibold">
            {quote.quotationDate} → {quote.validUntil}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Price guarantee period honored for commercial contracting.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Quotation Value</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
            ${quote.grandTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <section className="rounded-2xl border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border-light)] px-5 py-4">
          <h2 className="font-semibold text-sm">Quoted Line Items</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Product lines, offered unit pricing, and applicable line-item trade discounts.
          </p>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[var(--border-light)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="pb-3 font-medium">Product / SKU</th>
                <th className="pb-3 text-center font-medium">Quantity</th>
                <th className="pb-3 text-right font-medium">Offered Price</th>
                <th className="pb-3 text-right font-medium">Discount</th>
                <th className="pb-3 text-right font-medium">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-[var(--foreground)]">{item.productName}</p>
                    <p className="font-mono text-xs text-[var(--muted)]">{item.sku}</p>
                  </td>
                  <td className="py-3.5 text-center font-medium">{item.quantity}</td>
                  <td className="py-3.5 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-3.5 text-right text-emerald-700">
                    {item.discount > 0 ? `-$${item.discount.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-3.5 text-right font-semibold">
                    ${item.lineTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost Summary */}
        <div className="border-t border-[var(--border-light)] bg-[var(--muted-background)]/50 p-5">
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-[var(--muted)]">
              <span>Subtotal</span>
              <span className="font-medium text-[var(--foreground)]">
                ${quote.subtotal.toFixed(2)}
              </span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Total Discount</span>
                <span>-${quote.discount.toFixed(2)}</span>
              </div>
            )}
            {quote.tax > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Estimated Sales Tax</span>
                <span>${quote.tax.toFixed(2)}</span>
              </div>
            )}
            {quote.shippingCharges > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Shipping / Freight</span>
                <span>${quote.shippingCharges.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-lg font-semibold">
              <span>Quoted Grand Total</span>
              <span className="text-[var(--primary)]">${quote.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conversion Note */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 space-y-3">
          <h2 className="font-semibold text-sm">Terms & Conditions</h2>
          <p className="text-xs leading-5 text-[var(--muted)]">
            {quote.termsAndConditions || "Standard payment upon invoice issuance. 30 days quotation validity."}
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 space-y-3">
          <h2 className="font-semibold text-sm">Conversion & Inventory Rule</h2>
          <p className="text-xs leading-5 text-[var(--muted)]">
            A quotation is a price proposal and does <strong>not</strong> deduct or reserve physical inventory. Converting this quotation creates a billing draft invoice. Stock is committed only upon invoice issuance.
          </p>
        </section>
      </div>

      {/* Back button */}
      <div>
        <Link
          href="/quotations"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Back to Quotations
        </Link>
      </div>
    </div>
  );
}
