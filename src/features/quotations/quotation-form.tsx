"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Package,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { products } from "@/features/products/product.data";
import { salesChannels } from "@/features/sales-channels/sales-channel.data";
import type {
  Quotation,
  QuotationItem,
  QuotationStatus,
} from "./quotation.types";

interface QuotationFormProps {
  mode: "create" | "edit";
  quotation?: Quotation;
}

export function QuotationForm({ mode, quotation }: QuotationFormProps) {
  const isEdit = mode === "edit";

  const [quotationNumber, setQuotationNumber] = useState(
    quotation?.quotationNumber ??
      `QT-2026-00${Math.floor(Math.random() * 90 + 10)}`,
  );
  const [quotationDate, setQuotationDate] = useState(
    quotation?.quotationDate ?? "2026-10-28",
  );
  const [validUntil, setValidUntil] = useState(
    quotation?.validUntil ?? "2026-11-28",
  );
  const [buyerName, setBuyerName] = useState(quotation?.buyerName ?? "");
  const [buyerEmail, setBuyerEmail] = useState(quotation?.buyerEmail ?? "");
  const [buyerPhone, setBuyerPhone] = useState(quotation?.buyerPhone ?? "");
  const [salesChannelId, setSalesChannelId] = useState<number>(
    quotation?.salesChannelId ?? (salesChannels[0]?.id || 1),
  );
  const [shippingCharges, setShippingCharges] = useState(
    quotation?.shippingCharges !== undefined
      ? String(quotation.shippingCharges)
      : "50",
  );
  const [status, setStatus] = useState<QuotationStatus>(
    quotation?.status ?? "DRAFT",
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    quotation?.termsAndConditions ??
      "Prices guaranteed for 30 calendar days. Curbside pallet delivery included.",
  );
  const [notes, setNotes] = useState(quotation?.notes ?? "");

  const [items, setItems] = useState<QuotationItem[]>(
    quotation?.items ?? [
      {
        id: 1,
        productId: products[1]?.id || 2,
        sku: products[1]?.sku || "CHR-001",
        productName: products[1]?.name || "Luna Accent Chair",
        quantity: 2,
        unitPrice: products[1]?.sellingPrice || 420,
        discount: 0,
        taxRate: 8.25,
        lineTotal: Math.round(2 * 420 * 1.0825 * 100) / 100,
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
          selectedProd.taxRate || item.taxRate,
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
    const newItem: QuotationItem = {
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

  // Totals calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const totalTax = items.reduce((sum, item) => {
    const base = Math.max(0, item.quantity * item.unitPrice - item.discount);
    return sum + base * (item.taxRate / 100);
  }, 0);
  const shippingNum = Number(shippingCharges) || 0;
  const grandTotal = Math.round(
    (subtotal - totalDiscount + totalTax + shippingNum) * 100,
  ) / 100;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!buyerName.trim()) {
      newErrors.buyerName = "Buyer or Client Name is required.";
    }
    if (!quotationNumber.trim()) {
      newErrors.quotationNumber = "Quotation number is required.";
    }
    if (!validUntil) {
      newErrors.validUntil = "Validity date is required.";
    }
    if (items.length === 0) {
      newErrors.items = "At least one quote item is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setFeedbackMessage("");
      return;
    }

    const selectedChannel = salesChannels.find((c) => c.id === Number(salesChannelId));

    const payload: Quotation = {
      id: quotation?.id || Date.now(),
      quotationNumber,
      quotationDate,
      validUntil,
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim(),
      buyerPhone: buyerPhone.trim(),
      salesChannelId: Number(salesChannelId),
      salesChannelName: selectedChannel?.name || "Direct Sales",
      items,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      shippingCharges: shippingNum,
      grandTotal,
      termsAndConditions,
      notes: notes.trim(),
      status,
      createdAt: quotation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Quotation submitted payload:", payload);

    setFeedbackMessage(
      isEdit
        ? `Quotation ${quotationNumber} updated. Note: Backend API persistence is pending implementation.`
        : `Quotation ${quotationNumber} drafted successfully with grand total $${grandTotal.toFixed(2)}.`,
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/quotations"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
            aria-label="Back to quotations"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Quotation" : "Create Quotation"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isEdit
                ? `Update line pricing and terms for proposal ${quotation?.quotationNumber}.`
                : "Prepare a formalized price estimate with lock-in terms and product pricing."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/quotations"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="quotation-form"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Quotation"}
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

      <form id="quotation-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Buyer & Metadata Card */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Buyer & Quotation Information</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Recipient client details, sales origin, and validity window.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="buyer-name">
                Buyer / Company Name <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="buyer-name"
                className="form-input"
                value={buyerName}
                onChange={(e) => {
                  setBuyerName(e.target.value);
                  if (errors.buyerName) {
                    setErrors((prev) => ({ ...prev, buyerName: "" }));
                  }
                }}
                placeholder="e.g. Vance Interior Design Studio or Jane Doe"
                required
              />
              {errors.buyerName && (
                <p className="mt-1 text-xs text-[var(--danger)]">{errors.buyerName}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="quote-num">
                Quotation # <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="quote-num"
                className="form-input font-mono uppercase"
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                required
              />
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
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="buyer-phone">
                Buyer Phone
              </label>
              <input
                id="buyer-phone"
                type="tel"
                className="form-input"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="(212) 555-0198"
              />
            </div>

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
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="quote-date">
                Quotation Date <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="quote-date"
                type="date"
                className="form-input"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="valid-until">
                Valid Until <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="valid-until"
                type="date"
                className="form-input"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="quote-status">
                Status
              </label>
              <select
                id="quote-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product Items Table */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[var(--primary)]">
                <Package size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Quote Line Items</h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Add catalog products, customize quantities, unit prices, and trade discounts.
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
                  <th className="pb-3 font-medium w-24">Quantity</th>
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
                            {p.name} ({p.sku})
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

        {/* Terms & Totals Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold">Terms & Commercial Notes</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="quote-terms">
                Terms & Conditions
              </label>
              <textarea
                id="quote-terms"
                className="min-h-[80px] w-full resize-y rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]"
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="quote-notes">
                Internal Remarks
              </label>
              <textarea
                id="quote-notes"
                className="min-h-[70px] w-full resize-y rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Client specific notes, delivery constraints..."
              />
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold">Financial Summary</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Total Discounts</span>
              <span className="font-medium text-emerald-700">-${totalDiscount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Calculated Sales Tax</span>
              <span className="font-medium">${totalTax.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Freight / Delivery</span>
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

            <div className="border-t border-[var(--border-light)] pt-3 flex items-center justify-between text-lg font-semibold">
              <span>Grand Total</span>
              <span className="text-[var(--primary)]">${grandTotal.toFixed(2)}</span>
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 rounded-xl border border-[var(--border)] bg-white p-4">
          <Link
            href="/quotations"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Quotation"}
          </button>
        </div>
      </form>
    </div>
  );
}
