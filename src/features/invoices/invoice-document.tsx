import Image from "next/image";
import type { Invoice } from "./invoice.types";

interface InvoiceDocumentProps {
  invoice: Invoice;
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  return (
    <div className="mx-auto max-w-4xl bg-white p-8 sm:p-12 text-slate-800 font-sans print:p-0 print:max-w-none">
      {/* Document Header */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Sundara Furnishings"
              width={160}
              height={50}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="mt-3 text-xs leading-5 text-slate-500">
            <p className="font-semibold text-slate-700">Sundara Furnishings LLC</p>
            <p>4800 E 48th Ave, Suite 200</p>
            <p>Denver, CO 80216, United States</p>
            <p>Phone: (303) 555-0190 • billing@sundarafurnishings.com</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            INVOICE
          </h1>
          <p className="mt-1 font-mono text-base font-semibold text-emerald-800">
            {invoice.invoiceNumber}
          </p>
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            <p>
              <span className="text-slate-400">Invoice Date: </span>
              <span className="font-medium text-slate-800">{invoice.invoiceDate}</span>
            </p>
            <p>
              <span className="text-slate-400">Payment Due: </span>
              <span className="font-medium text-slate-800">{invoice.dueDate}</span>
            </p>
            {invoice.externalOrderId && (
              <p>
                <span className="text-slate-400">Channel Order Ref: </span>
                <span className="font-mono text-slate-700">{invoice.externalOrderId}</span>
              </p>
            )}
            <p>
              <span className="text-slate-400">Sales Channel: </span>
              <span className="font-medium text-slate-700">{invoice.salesChannelName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bill To & Ship To Grid */}
      <div className="grid gap-8 sm:grid-cols-2 py-8 border-b border-slate-200 text-xs">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            BILL TO
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">{invoice.buyerName}</p>
          {invoice.buyerEmail && <p className="text-slate-600 mt-0.5">{invoice.buyerEmail}</p>}
          {invoice.buyerPhone && <p className="text-slate-600">{invoice.buyerPhone}</p>}
          {invoice.billingAddress && (
            <p className="mt-2 text-slate-700 leading-relaxed max-w-xs">
              {invoice.billingAddress}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            SHIP TO / FULFILLMENT
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {invoice.shippingAddress ? invoice.buyerName : "Same as Billing Address"}
          </p>
          <p className="text-slate-600 leading-relaxed max-w-xs mt-0.5">
            {invoice.shippingAddress || invoice.billingAddress || "Storefront / Curbside Delivery"}
          </p>
          <p className="mt-2 text-slate-500">
            Origin Facility: <span className="font-medium text-slate-700">{invoice.warehouseName}</span>
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-8">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-slate-900 pb-3 text-slate-600 uppercase tracking-wider text-[11px]">
              <th className="pb-3 font-bold w-12 text-center">#</th>
              <th className="pb-3 font-bold">Item Description / SKU</th>
              <th className="pb-3 font-bold text-center w-20">Qty</th>
              <th className="pb-3 font-bold text-right w-24">Unit Price</th>
              <th className="pb-3 font-bold text-right w-20">Discount</th>
              <th className="pb-3 font-bold text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="align-top">
                <td className="py-3.5 text-center text-slate-400 font-mono">{index + 1}</td>
                <td className="py-3.5 pr-4">
                  <p className="font-semibold text-slate-900 text-sm">{item.productName}</p>
                  <p className="font-mono text-slate-400 text-[11px] mt-0.5">SKU: {item.sku}</p>
                </td>
                <td className="py-3.5 text-center font-semibold text-slate-800">{item.quantity}</td>
                <td className="py-3.5 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                <td className="py-3.5 text-right font-mono text-emerald-700">
                  {item.discount > 0 ? `-$${item.discount.toFixed(2)}` : "—"}
                </td>
                <td className="py-3.5 text-right font-semibold font-mono text-slate-900 text-sm">
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

      {/* Financial Totals & Payment Summary */}
      <div className="grid gap-8 sm:grid-cols-2 pt-6 border-t-2 border-slate-200">
        <div className="space-y-4 text-xs">
          <div>
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              Payment Terms & Instructions
            </p>
            <p className="mt-1.5 text-slate-700 leading-relaxed">
              {invoice.termsAndConditions ||
                "Payment is due within 30 days of invoice date. Wire transfer or ACH accepted."}
            </p>
          </div>

          {invoice.notes && (
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                Special Notes
              </p>
              <p className="mt-1 text-slate-600 leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="font-semibold text-slate-800">Status: </span>
            <span className="font-medium text-emerald-800">
              {invoice.status} • {invoice.paymentStatus}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600 sm:text-right">
          <div className="flex justify-between sm:justify-end sm:gap-12">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-mono font-medium text-slate-800">
              ${invoice.subtotal.toFixed(2)}
            </span>
          </div>

          {invoice.discountTotal > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-12 text-emerald-700">
              <span>Discounts:</span>
              <span className="font-mono">-${invoice.discountTotal.toFixed(2)}</span>
            </div>
          )}

          {invoice.taxTotal > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span className="text-slate-500">Sales Tax:</span>
              <span className="font-mono font-medium text-slate-800">
                ${invoice.taxTotal.toFixed(2)}
              </span>
            </div>
          )}

          {invoice.shippingCharges > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span className="text-slate-500">Shipping & Delivery:</span>
              <span className="font-mono font-medium text-slate-800">
                ${invoice.shippingCharges.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between sm:justify-end sm:gap-12 pt-3 border-t border-slate-200 text-sm font-bold text-slate-900">
            <span>Grand Total:</span>
            <span className="font-mono text-base text-emerald-900">
              ${invoice.grandTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between sm:justify-end sm:gap-12 pt-1 border-t border-slate-100">
            <span className="text-slate-500">Amount Paid:</span>
            <span className="font-mono font-medium text-slate-800">
              ${invoice.amountPaid.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between sm:justify-end sm:gap-12 font-bold text-xs">
            <span className="text-slate-700">Balance Due:</span>
            <span
              className={`font-mono ${
                invoice.balanceDue > 0 ? "text-amber-800" : "text-emerald-800"
              }`}
            >
              ${invoice.balanceDue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-slate-200 pt-6 text-center text-[11px] text-slate-400">
        <p>Thank you for partnering with Sundara Furnishings.</p>
        <p className="mt-0.5">
          Sundara Furnishings LLC • Modern Handcrafted Furniture & Interior Decor
        </p>
      </div>
    </div>
  );
}
