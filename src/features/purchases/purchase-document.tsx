import Image from "next/image";
import type { Purchase } from "./purchase.types";
import { suppliers } from "@/features/suppliers/supplier.data";
import { warehouses } from "@/features/warehouses/warehouse.data";

interface PurchaseDocumentProps {
  purchase: Purchase;
}

export function PurchaseDocument({ purchase }: PurchaseDocumentProps) {
  const supplier = suppliers.find((s) => s.id === purchase.supplierId);
  const warehouse = warehouses.find((w) => w.id === purchase.warehouseId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "ORDERED":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "DRAFT":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div
      id="purchase-document-pdf"
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
            <p>Phone: (303) 555-0190 • procurement@sundarafurnishings.com</p>
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            PURCHASE ORDER
          </h1>
          <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-800">
            {purchase.purchaseNumber}
          </p>
          <div className="mt-1 flex justify-end">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getStatusColor(
                purchase.status,
              )}`}
            >
              {purchase.status}
            </span>
          </div>

          <div className="mt-2 space-y-0.5 text-[11px] text-slate-600">
            <p>
              <span className="text-slate-400">Invoice Date: </span>
              <span className="font-medium text-slate-800">{purchase.purchaseDate}</span>
            </p>
            <p>
              <span className="text-slate-400">Inward Date: </span>
              <span className="font-medium text-slate-800">
                {purchase.expectedDate || "Pending Arrival"}
              </span>
            </p>
            {purchase.supplierInvoiceNumber && (
              <p>
                <span className="text-slate-400">Vendor Ref #: </span>
                <span className="font-mono text-slate-700">
                  {purchase.supplierInvoiceNumber}
                </span>
              </p>
            )}
            {purchase.containerNumber && (
              <p>
                <span className="text-slate-400">Container No: </span>
                <span className="font-mono font-semibold text-slate-900">
                  {purchase.containerNumber}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Supplier & Warehouse Ship-To Grid */}
      <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            VENDOR / SUPPLIER
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {purchase.supplierName}
          </p>
          {supplier?.contactPerson && (
            <p className="text-slate-600 text-[11px]">
              Contact: <span className="font-medium">{supplier.contactPerson}</span>
            </p>
          )}
          {supplier?.email && (
            <p className="text-slate-600 text-[11px]">{supplier.email}</p>
          )}
          {supplier?.phone && (
            <p className="text-slate-600 text-[11px]">{supplier.phone}</p>
          )}
          {supplier?.addressLine1 && (
            <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
              {supplier.addressLine1}
              {supplier.addressLine2 ? `, ${supplier.addressLine2}` : ""},{" "}
              {supplier.city}, {supplier.state} {supplier.postalCode}
            </p>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            SHIP TO / RECEIVING FACILITY
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {purchase.warehouseName}
          </p>
          <p className="text-slate-600 text-[11px]">
            Sundara Furnishings Inventory Receiving Dock
          </p>
          {warehouse?.address && (
            <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
              {warehouse.address}, {warehouse.city}, {warehouse.state}{" "}
              {warehouse.postalCode}
            </p>
          )}

          {/* Clean Container Callout without unwanted extra lines */}
          {purchase.containerNumber && (
            <div className="mt-2 rounded-md border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 inline-block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mr-2">
                CONTAINER NO:
              </span>
              <span className="font-mono text-xs font-bold text-amber-950">
                {purchase.containerNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="py-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-slate-900 pb-2 text-slate-600 uppercase tracking-wider text-[10px]">
              <th className="pb-2 font-bold w-8 text-center">#</th>
              <th className="pb-2 font-bold">Item Description / SKU</th>
              <th className="pb-2 font-bold text-center w-20">Ordered</th>
              <th className="pb-2 font-bold text-center w-20">Received</th>
              <th className="pb-2 font-bold text-right w-24">Unit Cost</th>
              <th className="pb-2 font-bold text-right w-20">Discount</th>
              <th className="pb-2 font-bold text-right w-24">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchase.items.map((item, index) => (
              <tr key={item.id} className="align-top">
                <td className="py-2 text-center text-slate-400 font-mono text-[11px]">
                  {index + 1}
                </td>
                <td className="py-2 pr-3">
                  <p className="font-semibold text-slate-900 text-xs">
                    {item.productName}
                  </p>
                  <p className="font-mono text-slate-400 text-[10px]">
                    SKU: {item.sku}
                  </p>
                </td>
                <td className="py-2 text-center font-semibold text-slate-800 text-xs">
                  {item.quantity}
                </td>
                <td className="py-2 text-center font-medium">
                  <span
                    className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      item.receivedQuantity >= item.quantity
                        ? "bg-emerald-50 text-emerald-800"
                        : item.receivedQuantity > 0
                        ? "bg-blue-50 text-blue-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.receivedQuantity} / {item.quantity}
                  </span>
                </td>
                <td className="py-2 text-right font-mono text-xs">
                  ${item.unitCost.toFixed(2)}
                </td>
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

      {/* Financial Totals & Logistics Notes */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200">
        <div className="space-y-3 text-xs">
          <div>
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Delivery Instructions & Logistics Notes
            </p>
            <p className="mt-1 text-slate-700 text-[11px] leading-relaxed">
              {purchase.notes ||
                "Standard dock receiving policy applies. Inspect packaging, pallet counts, and verify SKU barcodes upon check-in."}
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-[10px] text-slate-600">
            <span className="font-semibold text-slate-800">Receiving Policy: </span>
            Stock commitments are formally registered in destination inventory records upon physical check-in.
          </div>

          {/* Receiving Verification Sign-off */}
          <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">
              AUTHORIZED RECEIVING DOCK VERIFICATION
            </p>
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div className="border-t border-dashed border-slate-300 pt-1">
                <span className="text-slate-400">Received By (Signature)</span>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-1">
                <span className="text-slate-400">Date Received & Stamp</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 text-right">
          <div className="flex justify-between sm:justify-end sm:gap-10">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-mono font-medium text-slate-800">
              ${purchase.subtotal.toFixed(2)}
            </span>
          </div>

          {purchase.discount > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-10 text-emerald-700">
              <span>Item Discounts:</span>
              <span className="font-mono">-${purchase.discount.toFixed(2)}</span>
            </div>
          )}

          {purchase.tax > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-10">
              <span className="text-slate-500">Tax:</span>
              <span className="font-mono font-medium text-slate-800">
                ${purchase.tax.toFixed(2)}
              </span>
            </div>
          )}

          {purchase.additionalCharges > 0 && (
            <div className="flex justify-between sm:justify-end sm:gap-10">
              <span className="text-slate-500">Freight & Additional Charges:</span>
              <span className="font-mono font-medium text-slate-800">
                ${purchase.additionalCharges.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between sm:justify-end sm:gap-10 pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
            <span>Grand Total:</span>
            <span className="font-mono text-sm text-emerald-900">
              ${purchase.grandTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between sm:justify-end sm:gap-10 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500">Amount Paid:</span>
            <span className="font-mono font-medium text-slate-800">
              ${purchase.amountPaid.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between sm:justify-end sm:gap-10 font-bold text-xs">
            <span className="text-slate-700">Balance Due:</span>
            <span
              className={`font-mono ${
                purchase.balanceDue > 0 ? "text-amber-800" : "text-emerald-800"
              }`}
            >
              ${purchase.balanceDue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
        <p>Sundara Furnishings LLC • Procurement & Supply Chain Management • Denver CDC</p>
      </div>
    </div>
  );
}
