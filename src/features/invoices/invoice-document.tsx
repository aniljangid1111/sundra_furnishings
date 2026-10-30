import Image from "next/image";
import type { Invoice } from "./invoice.types";

interface InvoiceDocumentProps {
  invoice: Invoice;
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  return (
    <div
      id="invoice-document-pdf"
      className="w-[794px] min-h-[1120px] bg-white p-7 text-slate-800 font-sans mx-auto box-border"
      style={{ boxSizing: "border-box" }}
    >
      {/* Document Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Sundara Furnishings"
              width={150}
              height={45}
              priority
              className="h-9 w-auto object-contain"
            />
          </div>
          <div className="mt-2 text-[11px] leading-4 text-slate-500">
            <p className="font-semibold text-slate-700">Sundara Furnishings LLC</p>
            <p>4800 E 48th Ave, Suite 200 • Denver, CO 80216</p>
            <p>Phone: (303) 555-0190 • billing@sundarafurnishings.com</p>
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            INVOICE
          </h1>
          <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-800">
            {invoice.invoiceNumber}
          </p>
          <div className="mt-2 space-y-0.5 text-[11px] text-slate-600">
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
      <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            BILL TO
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">{invoice.buyerName}</p>
          {invoice.buyerEmail && <p className="text-slate-600 text-[11px] mt-0.5">{invoice.buyerEmail}</p>}
          {invoice.buyerPhone && <p className="text-slate-600 text-[11px]">{invoice.buyerPhone}</p>}
          {invoice.billingAddress && (
            <p className="mt-1 text-slate-600 text-[11px] leading-relaxed max-w-xs">
              {invoice.billingAddress}
            </p>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            SHIP TO / FULFILLMENT
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {invoice.shippingAddress ? invoice.buyerName : "Same as Billing Address"}
          </p>
          <p className="text-slate-600 text-[11px] leading-relaxed max-w-xs mt-0.5">
            {invoice.shippingAddress || invoice.billingAddress || "Storefront / Curbside Delivery"}
          </p>
          <p className="mt-1.5 text-slate-500 text-[11px]">
            Origin Facility: <span className="font-medium text-slate-700">{invoice.warehouseName}</span>
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-slate-900 pb-2 text-slate-600 uppercase tracking-wider text-[10px]">
              <th className="pb-2 font-bold w-8 text-center">#</th>
              <th className="pb-2 font-bold">Item Description / SKU</th>
              <th className="pb-2 font-bold text-center w-20">Qty</th>
              <th className="pb-2 font-bold text-right w-24">Unit Price</th>
              <th className="pb-2 font-bold text-right w-20">Discount</th>
              <th className="pb-2 font-bold text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="align-top">
                <td className="py-2 text-center text-slate-400 font-mono text-[11px]">{index + 1}</td>
                <td className="py-2 pr-3">
                  <p className="font-semibold text-slate-900 text-xs">{item.productName}</p>
                  <p className="font-mono text-slate-400 text-[10px] mt-0.5">SKU: {item.sku}</p>
                </td>
                <td className="py-2 text-center font-semibold text-slate-800 text-xs">{item.quantity}</td>
                <td className="py-2 text-right font-mono text-xs">${item.unitPrice.toFixed(2)}</td>
                <td className="py-2 text-right font-mono text-emerald-700 text-xs">
                  {item.discount > 0 ? `-$${item.discount.toFixed(2)}` : "—"}
                </td>
                <td className="py-2 text-right font-semibold font-mono text-slate-900 text-xs">
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
      <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200">
        <div className="space-y-3 text-xs">
          <div>
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Payment Terms & Instructions
            </p>
            <p className="mt-1 text-slate-700 text-[11px] leading-relaxed">
              {invoice.termsAndConditions ||
                "Payment is due within 30 days of invoice date. Wire transfer or ACH accepted."}
            </p>
          </div>

          {invoice.notes && (
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Special Notes
              </p>
              <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-[10px]">
            <span className="font-semibold text-slate-800">Status: </span>
            <span className="font-medium text-emerald-800">
              {invoice.status} • {invoice.paymentStatus}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 text-right">
          <div className="flex justify-between sm:justify-end sm:gap-10">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-mono font-medium text-slate-800">
              ${invoice.subtotal.toFixed(2)}
            </span>
          </div>

          {invoice.discountTotal > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-10 text-emerald-700">
              <span>Discounts:</span>
              <span className="font-mono">-${invoice.discountTotal.toFixed(2)}</span>
            </div>
          )}

          {invoice.taxTotal > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-10">
              <span className="text-slate-500">Sales Tax:</span>
              <span className="font-mono font-medium text-slate-800">
                ${invoice.taxTotal.toFixed(2)}
              </span>
            </div>
          )}

          {invoice.shippingCharges > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-10">
              <span className="text-slate-500">Shipping & Delivery:</span>
              <span className="font-mono font-medium text-slate-800">
                ${invoice.shippingCharges.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between sm:justify-end sm:gap-10 pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
            <span>Grand Total:</span>
            <span className="font-mono text-sm text-emerald-900">
              ${invoice.grandTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between sm:justify-end sm:gap-10 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500">Amount Paid:</span>
            <span className="font-mono font-medium text-slate-800">
              ${invoice.amountPaid.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between sm:justify-end sm:gap-10 font-bold text-xs">
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
      <div className="mt-6 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
        <p>Thank you for partnering with Sundara Furnishings LLC • Modern Handcrafted Furniture</p>
      </div>
    </div>
  );
}
