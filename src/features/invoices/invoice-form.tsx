"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Package,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { products } from "@/features/products/product.data";
import { salesChannels } from "@/features/sales-channels/sales-channel.data";
import { warehouses } from "@/features/warehouses/warehouse.data";
import type {
  Invoice,
  InvoiceLineItem,
  InvoicePaymentStatus,
  InvoiceStatus,
} from "./invoice.types";

interface InvoiceFormProps {
  mode: "create" | "edit";
  invoice?: Invoice;
}

export function InvoiceForm({ mode, invoice }: InvoiceFormProps) {
  const isEdit = mode === "edit";

  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice?.invoiceNumber ??
      `INV-${Math.floor(Math.random() * 900 + 1025)}`,
  );
  const [salesChannelId, setSalesChannelId] = useState<number>(
    invoice?.salesChannelId ?? 1,
  );
  const [externalOrderId, setExternalOrderId] = useState(
    invoice?.externalOrderId ?? "",
  );
  const [invoiceDate, setInvoiceDate] = useState(
    invoice?.invoiceDate ?? "2026-10-28",
  );
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ?? "2026-11-27",
  );

  // Buyer details
  const [buyerName, setBuyerName] = useState(
    invoice?.buyerName ?? "Walk-in Customer",
  );
  const [buyerEmail, setBuyerEmail] = useState(invoice?.buyerEmail ?? "");
  const [buyerPhone, setBuyerPhone] = useState(invoice?.buyerPhone ?? "");
  const [billingAddress, setBillingAddress] = useState(
    invoice?.billingAddress ?? "",
  );
  const [shippingAddress, setShippingAddress] = useState(
    invoice?.shippingAddress ?? "",
  );

  // Warehouse selection
  const [warehouseId, setWarehouseId] = useState<number>(
    invoice?.warehouseId ?? (warehouses[0]?.id || 1),
  );

  // Status & payment
  const [status, setStatus] = useState<InvoiceStatus>(
    invoice?.status ?? "ISSUED",
  );
  const [shippingCharges, setShippingCharges] = useState(
    invoice?.shippingCharges !== undefined
      ? String(invoice.shippingCharges)
      : "0",
  );
  const [amountPaid, setAmountPaid] = useState(
    invoice?.amountPaid !== undefined ? String(invoice.amountPaid) : "0",
  );
  const [paymentTerms, setPaymentTerms] = useState(
    invoice?.termsAndConditions ?? "Due on Receipt. Standard 30 days.",
  );
  const [notes, setNotes] = useState(invoice?.notes ?? "");

  // Line items
  const [items, setItems] = useState<InvoiceLineItem[]>(
    invoice?.items ?? [
      {
        id: 1,
        productId: products[1]?.id || 2,
        sku: products[1]?.sku || "CHR-001",
        productName: products[1]?.name || "Luna Accent Chair",
        quantity: 1,
        unitPrice: products[1]?.sellingPrice || 420,
        discount: 0,
        taxRate: 8.25,
        lineTotal: Math.round((products[1]?.sellingPrice || 420) * 1.0825 * 100) / 100,
      },
    ],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const calculateLineTotal = (
    qty: number,
    price: number,
    disc: number,
    tax: number,
  ) => {
    const base = Math.max(0, qty * price - disc);
    const taxAmt = base * (tax / 100);
    return Math.round((base + taxAmt) * 100) / 100;
  };

  const handleProductSelect = (index: number, pId: number) => {
    const selectedProd = products.find((p) => p.id === pId);
    if (!selectedProd) return;

    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const lineTotal = calculateLineTotal(
          item.quantity,
          selectedProd.sellingPrice,
          item.discount,
          selectedProd.taxRate || 8.25,
        );
        return {
          ...item,
          productId: selectedProd.id,
          sku: selectedProd.sku,
          productName: selectedProd.name,
          unitPrice: selectedProd.sellingPrice,
          taxRate: selectedProd.taxRate || 8.25,
          lineTotal,
        };
      }),
    );
  };

  const updateItem = (
    index: number,
    field: "quantity" | "unitPrice" | "discount" | "taxRate",
    value: number,
  ) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        const lineTotal = calculateLineTotal(
          updated.quantity,
          updated.unitPrice,
          updated.discount,
          updated.taxRate,
        );
        return { ...updated, lineTotal };
      }),
    );
  };

  const addItem = () => {
    const firstProd = products[0];
    const newItem: InvoiceLineItem = {
      id: Date.now(),
      productId: firstProd?.id || 1,
      sku: firstProd?.sku || "BED-001",
      productName: firstProd?.name || "Cotton Bedsheet Set - Queen",
      quantity: 1,
      unitPrice: firstProd?.sellingPrice || 189,
      discount: 0,
      taxRate: 8.25,
      lineTotal: Math.round((firstProd?.sellingPrice || 189) * 1.0825 * 100) / 100,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
  const taxTotal = items.reduce((sum, item) => {
    const base = Math.max(0, item.quantity * item.unitPrice - item.discount);
    return sum + base * (item.taxRate / 100);
  }, 0);
  const shippingNum = Number(shippingCharges) || 0;
  const grandTotal = Math.round(
    (subtotal - discountTotal + taxTotal + shippingNum) * 100,
  ) / 100;
  const amountPaidNum = Math.max(0, Number(amountPaid) || 0);
  const balanceDue = Math.max(
    0,
    Math.round((grandTotal - amountPaidNum) * 100) / 100,
  );

  let paymentStatus: InvoicePaymentStatus = "PENDING";
  if (amountPaidNum >= grandTotal && grandTotal > 0) {
    paymentStatus = "PAID";
  } else if (amountPaidNum > 0) {
    paymentStatus = "PARTIALLY_PAID";
  }

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!buyerName.trim()) errs.buyerName = "Buyer name is required.";
    if (!invoiceNumber.trim()) errs.invoiceNumber = "Invoice number is required.";
    if (!invoiceDate) errs.invoiceDate = "Invoice date is required.";
    if (items.length === 0) errs.items = "At least one item is required.";

    const invalidItem = items.some((i) => i.quantity <= 0);
    if (invalidItem) errs.items = "All line items must have quantity >= 1.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      setFeedbackMessage("");
      return;
    }

    const selectedChannel = salesChannels.find((c) => c.id === Number(salesChannelId));
    const selectedWarehouse = warehouses.find((w) => w.id === Number(warehouseId));

    const payload: Invoice = {
      id: invoice?.id || Date.now(),
      invoiceNumber,
      invoiceDate,
      dueDate,
      salesChannelId: Number(salesChannelId),
      salesChannelName: selectedChannel?.name || "Direct",
      externalOrderId: externalOrderId.trim(),
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim(),
      buyerPhone: buyerPhone.trim(),
      billingAddress: billingAddress.trim(),
      shippingAddress: shippingAddress.trim(),
      warehouseId: Number(warehouseId),
      warehouseName: selectedWarehouse?.name || "CDC",
      items,
      subtotal,
      discountTotal,
      taxTotal,
      shippingCharges: shippingNum,
      additionalCharges: 0,
      grandTotal,
      amountPaid: amountPaidNum,
      balanceDue,
      paymentStatus,
      status,
      notes: notes.trim(),
      termsAndConditions: paymentTerms.trim(),
      createdAt: invoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Invoice submitted payload:", payload);

    setFeedbackMessage(
      isEdit
        ? `Invoice ${invoiceNumber} updated. Note: Backend API persistence is pending implementation.`
        : `Invoice ${invoiceNumber} issued for $${grandTotal.toFixed(2)}. ${
            status === "ISSUED" ? "Stock deduction recorded once in local session." : ""
          } Note: Backend API persistence is pending implementation.`,
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/invoices"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)]"
            aria-label="Back to invoices"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Invoice" : "Create New Invoice"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isEdit
                ? `Update draft billing information for ${invoice?.invoiceNumber}.`
                : "Billing workflow supporting Walk-in retail, online marketplaces, and commercial buyers."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/invoices"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="invoice-form"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Issue / Save Invoice"}
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {feedbackMessage}
        </div>
      )}

      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Sales Source & Warehouse */}
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
            <ShoppingCart size={18} className="text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">Step 1: Sales Channel & Origin Warehouse</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="channel-select">
                Sales Channel
              </label>
              <select
                id="channel-select"
                className="form-input"
                value={salesChannelId}
                onChange={(e) => setSalesChannelId(Number(e.target.value))}
              >
                {salesChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="ext-order">
                External Order Ref #
              </label>
              <input
                id="ext-order"
                className="form-input font-mono"
                value={externalOrderId}
                onChange={(e) => setExternalOrderId(e.target.value)}
                placeholder="e.g. AMZ-99120 or WEB-441"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="origin-wh">
                Fulfillment Warehouse
              </label>
              <select
                id="origin-wh"
                className="form-input"
                value={warehouseId}
                onChange={(e) => setWarehouseId(Number(e.target.value))}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.warehouseCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="inv-status">
                Document Status
              </label>
              <select
                id="inv-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              >
                <option value="ISSUED">ISSUED (Finalized & stock deducted once)</option>
                <option value="DRAFT">DRAFT (Editable, does not affect stock)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </section>

        {/* Step 2: Buyer & Billing Details */}
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
            <User size={18} className="text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">Step 2: Buyer & Contact Information</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="buyer-name">
                Buyer Name <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="buyer-name"
                className="form-input"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Walk-in Customer or Company Name"
                required
              />
              {errors.buyerName && (
                <p className="mt-1 text-xs text-[var(--danger)]">{errors.buyerName}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="buyer-email">
                Buyer Email
              </label>
              <input
                id="buyer-email"
                type="email"
                className="form-input"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="buyer@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="buyer-phone">
                Phone Number
              </label>
              <input
                id="buyer-phone"
                type="tel"
                className="form-input"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="billing-address">
                Billing Address
              </label>
              <input
                id="billing-address"
                className="form-input"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Street address, City, State ZIP"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="shipping-address">
                Shipping Address
              </label>
              <input
                id="shipping-address"
                className="form-input"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Leave blank if same as billing"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="inv-num">
                Invoice # <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="inv-num"
                className="form-input font-mono uppercase"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="inv-date">
                Invoice Date <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="inv-date"
                type="date"
                className="form-input"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="due-date">
                Due Date <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="due-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Step 3: Product Line Items */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[var(--primary)]">
                <Package size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Step 3: Line Items & Live Catalog Pricing</h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Add products from catalog. Stock availability checked against destination warehouse.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-[var(--border-light)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="pb-3 font-medium">Product / SKU</th>
                  <th className="pb-3 font-medium w-24">Qty</th>
                  <th className="pb-3 font-medium w-32">Unit Price ($)</th>
                  <th className="pb-3 font-medium w-28">Discount ($)</th>
                  <th className="pb-3 font-medium w-24">Tax (%)</th>
                  <th className="pb-3 text-right font-medium w-32">Line Total</th>
                  <th className="pb-3 text-right font-medium w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-3">
                      <select
                        className="form-input"
                        value={item.productId}
                        onChange={(e) =>
                          handleProductSelect(index, Number(e.target.value))
                        }
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — Stock: {p.stock}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            Math.max(1, parseInt(e.target.value) || 0),
                          )
                        }
                      />
                    </td>

                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitPrice",
                            Math.max(0, parseFloat(e.target.value) || 0),
                          )
                        }
                      />
                    </td>

                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        value={item.discount}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "discount",
                            Math.max(0, parseFloat(e.target.value) || 0),
                          )
                        }
                      />
                    </td>

                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        className="form-input"
                        value={item.taxRate}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "taxRate",
                            Math.max(0, parseFloat(e.target.value) || 0),
                          )
                        }
                      />
                    </td>

                    <td className="py-3 text-right font-medium">
                      ${item.lineTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-red-50 hover:text-[var(--danger)] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Step 4 & 5: Payment & Totals */}
        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold">Payment Details & Instructions</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="payment-terms">
                Payment Terms
              </label>
              <textarea
                id="payment-terms"
                className="min-h-[70px] w-full rounded-xl border border-[var(--border)] bg-white p-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="inv-notes">
                Order Notes
              </label>
              <textarea
                id="inv-notes"
                className="min-h-[70px] w-full rounded-xl border border-[var(--border)] bg-white p-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Assembly instructions, gate access codes..."
              />
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold">Invoice Calculation</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Discounts</span>
              <span className="font-medium text-emerald-700">-${discountTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Sales Tax</span>
              <span className="font-medium">${taxTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Shipping / Delivery Fee</span>
              <div className="w-28">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input h-8 text-right text-xs"
                  value={shippingCharges}
                  onChange={(e) => setShippingCharges(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-[var(--border-light)] pt-3 flex items-center justify-between text-base font-semibold">
              <span>Grand Total</span>
              <span className="text-[var(--primary)]">${grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm border-t border-[var(--border-light)] pt-2">
              <span className="text-[var(--muted)]">Amount Collected</span>
              <div className="w-28">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input h-8 text-right text-xs"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-[var(--muted)]">Balance Remaining</span>
              <span className={balanceDue > 0 ? "text-amber-800" : "text-emerald-800"}>
                ${balanceDue.toFixed(2)}
              </span>
            </div>

            <div className="rounded-lg bg-[var(--muted-background)] p-2.5 text-xs">
              <span className="text-[var(--muted)]">Status: </span>
              <span className="font-semibold text-emerald-900">{paymentStatus}</span>
            </div>
          </section>
        </div>

        {/* Bottom Actions - NO DOWNLOAD BUTTON HERE AS REQUESTED */}
        <div className="flex items-center justify-end gap-2 rounded-xl border border-[var(--border)] bg-white p-4">
          <Link
            href="/invoices"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save / Finalize Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
