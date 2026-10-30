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
  FileText,
  Loader2,
  PackageCheck,
  Pencil,
  Truck,
  Warehouse,
} from "lucide-react";
import { purchases } from "@/features/purchases/purchase.data";
import { downloadPurchasePdf } from "@/lib/pdf-export";

interface PurchaseViewPageProps {
  params: Promise<{ id: string }>;
}

export default function PurchaseViewPage({ params }: PurchaseViewPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-[var(--muted)]">
          Loading purchase order details...
        </div>
      }
    >
      <PurchaseViewContent params={params} />
    </Suspense>
  );
}

function PurchaseViewContent({ params }: PurchaseViewPageProps) {
  const { id } = use(params);
  const [isDownloading, setIsDownloading] = useState(false);

  const purchase = purchases.find(
    (p) =>
      p.id === Number(id) ||
      p.purchaseNumber.toLowerCase() === id.toLowerCase(),
  );

  if (!purchase) {
    notFound();
  }

  const isReceived = purchase.status === "RECEIVED";
  const isCancelled = purchase.status === "CANCELLED";

  // Direct 1-Click PDF Download (jsPDF library - No print preview dialog)
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadPurchasePdf(purchase);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* Top Header - Back button ONLY at top next to title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/purchases"
            aria-label="Back to purchases"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                {purchase.purchaseNumber}
              </h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isReceived
                    ? "bg-emerald-50 text-[var(--success)]"
                    : isCancelled
                    ? "bg-red-50 text-[var(--danger)]"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {purchase.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Supplier:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {purchase.supplierName}
              </span>
              {purchase.supplierInvoiceNumber &&
                ` • Vendor Inv: ${purchase.supplierInvoiceNumber}`}
              {purchase.containerNumber &&
                ` • Container: ${purchase.containerNumber}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isReceived && !isCancelled && (
            <Link
              href={`/purchases/edit/${purchase.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium hover:bg-[var(--muted-background)] shadow-sm"
            >
              <Pencil size={15} />
              Edit Order
            </Link>
          )}

          <Link
            href="/inventory"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted-background)]"
          >
            <Warehouse size={15} />
            Warehouse Stock
          </Link>

          {/* Direct PDF Download Action (Pure jsPDF - Downloads directly) */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download Purchase Order PDF directly"
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

      {/* Overview Cards Grid - Horizontal Layout from Image 3 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Card 1: Supplier & Vendor Details */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Building2 size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                SUPPLIER / VENDOR
              </p>
              <p
                className="mt-0.5 text-sm font-bold text-[var(--foreground)] truncate"
                title={purchase.supplierName}
              >
                {purchase.supplierName}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5 truncate font-mono">
                {purchase.supplierInvoiceNumber
                  ? `Inv: ${purchase.supplierInvoiceNumber}`
                  : "No Vendor Inv #"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Container Information (Highlighted) */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Truck size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                CONTAINER NO.
              </p>
              <p className="mt-0.5 font-mono text-sm font-extrabold text-amber-950 truncate">
                {purchase.containerNumber || "Not Assigned"}
              </p>
              <p className="text-xs text-amber-700 mt-0.5 truncate">
                Freight Tracking Ref
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Receiving Facility */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Warehouse size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                DESTINATION
              </p>
              <p
                className="mt-0.5 text-sm font-bold text-[var(--foreground)] truncate"
                title={purchase.warehouseName}
              >
                {purchase.warehouseName}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
                Receiving Facility
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Invoice / Inward Date */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Calendar size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                INVOICE / INWARD
              </p>
              <p className="mt-0.5 text-sm font-bold text-[var(--foreground)] truncate">
                {purchase.purchaseDate}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
                Inward: {purchase.expectedDate || "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 5: Total Value */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                TOTAL VALUE
              </p>
              <p className="mt-0.5 text-base font-extrabold text-[var(--primary)] truncate">
                $
                {purchase.grandTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p
                className={`text-xs font-semibold mt-0.5 truncate ${
                  purchase.balanceDue > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                Balance: ${purchase.balanceDue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border-light)] px-6 py-4">
          <h2 className="font-semibold text-base">Procured Line Items</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Products, units, unit costs, and receiving quantities for this shipment.
          </p>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[var(--border-light)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="pb-3 font-medium">Product / SKU</th>
                <th className="pb-3 text-center font-medium">Ordered Qty</th>
                <th className="pb-3 text-center font-medium">Received Qty</th>
                <th className="pb-3 text-right font-medium">Unit Cost</th>
                <th className="pb-3 text-right font-medium">Discount</th>
                <th className="pb-3 text-right font-medium">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {purchase.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-[var(--foreground)]">
                      {item.productName}
                    </p>
                    <p className="font-mono text-xs text-[var(--muted)] mt-0.5">
                      {item.sku}
                    </p>
                  </td>
                  <td className="py-3.5 text-center font-medium">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.receivedQuantity >= item.quantity
                          ? "bg-emerald-50 text-emerald-800"
                          : item.receivedQuantity > 0
                          ? "bg-blue-50 text-blue-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {item.receivedQuantity} / {item.quantity}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-mono">${item.unitCost.toFixed(2)}</td>
                  <td className="py-3.5 text-right text-emerald-700 font-mono">
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

        {/* Totals Breakdown */}
        <div className="border-t border-[var(--border-light)] bg-[var(--muted-background)]/40 p-6">
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-[var(--muted)]">
              <span>Subtotal</span>
              <span className="font-medium text-[var(--foreground)] font-mono">
                ${purchase.subtotal.toFixed(2)}
              </span>
            </div>
            {purchase.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discounts</span>
                <span className="font-mono">-${purchase.discount.toFixed(2)}</span>
              </div>
            )}
            {purchase.tax > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Tax</span>
                <span className="font-mono">${purchase.tax.toFixed(2)}</span>
              </div>
            )}
            {purchase.additionalCharges > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Freight & Charges</span>
                <span className="font-mono">${purchase.additionalCharges.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-bold">
              <span>Grand Total</span>
              <span className="text-[var(--primary)] font-mono">
                ${purchase.grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--border-light)] pt-2 text-xs">
              <span className="text-[var(--muted)]">Amount Paid</span>
              <span className="font-medium font-mono">${purchase.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[var(--muted)]">Balance Due</span>
              <span
                className={`font-mono ${
                  purchase.balanceDue > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                ${purchase.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Receiving & Notes Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <PackageCheck size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold text-sm">Inventory Receiving Policy</h2>
          </div>
          <p className="text-xs leading-5 text-[var(--muted)]">
            Purchases in <strong>RECEIVED</strong> status automatically update
            on-hand stock and ledger balances in the designated warehouse. DRAFT
            and ORDERED records do not commit stock until physically verified.
          </p>
          <div className="rounded-lg bg-[var(--muted-background)] p-3 text-xs">
            <span className="font-medium text-[var(--foreground)]">
              Warehouse Ledger:{" "}
            </span>
            {isReceived
              ? "All line quantities have been registered to warehouse bin locations."
              : "Pending arrival and dock check-in."}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold text-sm">Logistics & Internal Notes</h2>
          </div>
          {purchase.containerNumber && (
            <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-2.5 text-xs">
              <span className="font-bold text-amber-900">
                Container No:{" "}
              </span>
              <span className="font-mono font-bold text-amber-950">
                {purchase.containerNumber}
              </span>
            </div>
          )}
          <p className="text-xs leading-relaxed text-[var(--foreground)]">
            {purchase.notes ||
              "No special logistics notes attached to this purchase order."}
          </p>
        </section>
      </div>
    </div>
  );
}
