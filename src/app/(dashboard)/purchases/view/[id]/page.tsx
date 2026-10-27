import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Package,
  PackageCheck,
  Pencil,
  Receipt,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";
import { purchases } from "@/features/purchases/purchase.data";

interface PurchaseViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseViewPage({
  params,
}: PurchaseViewPageProps) {
  const { id } = await params;

  const purchase = purchases.find((p) => p.id === Number(id));

  if (!purchase) {
    notFound();
  }

  const isReceived = purchase.status === "RECEIVED";
  const isCancelled = purchase.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
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
              <h1 className="text-2xl font-semibold tracking-tight">
                {purchase.purchaseNumber}
              </h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
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
              Supplier: <span className="font-medium text-[var(--foreground)]">{purchase.supplierName}</span>
              {purchase.supplierInvoiceNumber && ` • Vendor Inv: ${purchase.supplierInvoiceNumber}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isReceived && !isCancelled && (
            <Link
              href={`/purchases/edit/${purchase.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium hover:bg-[var(--muted-background)]"
            >
              <Pencil size={16} />
              Edit Order
            </Link>
          )}

          <Link
            href="/inventory"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Warehouse size={16} />
            View Warehouse Stock
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Truck size={19} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Receiving Destination
              </p>
              <p className="mt-0.5 text-sm font-semibold">{purchase.warehouseName}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Calendar size={19} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Order / Expected
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                {purchase.purchaseDate} {purchase.expectedDate ? `(Exp: ${purchase.expectedDate})` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard size={19} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Total Value
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--primary)]">
                ${purchase.grandTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <section className="rounded-2xl border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border-light)] px-5 py-4">
          <h2 className="font-semibold">Procured Line Items</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Products, units, unit costs, and receiving quantities for this shipment.
          </p>
        </div>

        <div className="overflow-x-auto p-5">
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
                <tr key={item.id}>
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-[var(--foreground)]">{item.productName}</p>
                    <p className="font-mono text-xs text-[var(--muted)]">{item.sku}</p>
                  </td>
                  <td className="py-3.5 text-center font-medium">{item.quantity}</td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.receivedQuantity >= item.quantity
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {item.receivedQuantity} / {item.quantity}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">${item.unitCost.toFixed(2)}</td>
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

        {/* Totals Breakdown */}
        <div className="border-t border-[var(--border-light)] bg-[var(--muted-background)]/50 p-5">
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-[var(--muted)]">
              <span>Subtotal</span>
              <span className="font-medium text-[var(--foreground)]">
                ${purchase.subtotal.toFixed(2)}
              </span>
            </div>
            {purchase.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discounts</span>
                <span>-${purchase.discount.toFixed(2)}</span>
              </div>
            )}
            {purchase.tax > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Tax</span>
                <span>${purchase.tax.toFixed(2)}</span>
              </div>
            )}
            {purchase.additionalCharges > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Freight & Charges</span>
                <span>${purchase.additionalCharges.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold">
              <span>Grand Total</span>
              <span className="text-[var(--primary)]">${purchase.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border-light)] pt-2 text-xs">
              <span className="text-[var(--muted)]">Amount Paid</span>
              <span className="font-medium">${purchase.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[var(--muted)]">Balance Due</span>
              <span className={purchase.balanceDue > 0 ? "text-amber-700" : "text-emerald-700"}>
                ${purchase.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Receiving & Notes Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <PackageCheck size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold text-sm">Inventory Receiving Policy</h2>
          </div>
          <p className="text-xs leading-5 text-[var(--muted)]">
            Purchases in <strong>RECEIVED</strong> status automatically update on-hand stock and ledger balances in the designated warehouse. DRAFT and ORDERED records do not commit stock until physically verified.
          </p>
          <div className="rounded-lg bg-[var(--muted-background)] p-3 text-xs">
            <span className="font-medium text-[var(--foreground)]">Warehouse Ledger: </span>
            {isReceived
              ? "All line quantities have been registered to warehouse bin locations."
              : "Pending arrival and dock check-in."}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold text-sm">Logistics & Internal Notes</h2>
          </div>
          <p className="text-xs leading-5 text-[var(--foreground)]">
            {purchase.notes || "No special logistics notes attached to this purchase order."}
          </p>
        </section>
      </div>

      {/* Back button */}
      <div>
        <Link
          href="/purchases"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Back to Purchases
        </Link>
      </div>
    </div>
  );
}
