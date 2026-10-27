"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Building2,
  Package,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { suppliers } from "@/features/suppliers/supplier.data";
import { products } from "@/features/products/product.data";
import { warehouses } from "@/features/warehouses/warehouse.data";
import type {
  Purchase,
  PurchaseItem,
  PurchaseStatus,
} from "./purchase.types";

interface PurchaseFormProps {
  mode: "create" | "edit";
  purchase?: Purchase;
}

export function PurchaseForm({ mode, purchase }: PurchaseFormProps) {
  const isEdit = mode === "edit";

  const [purchaseNumber, setPurchaseNumber] = useState(
    purchase?.purchaseNumber ??
      `PO-2026-00${Math.floor(Math.random() * 90 + 10)}`,
  );
  const [supplierId, setSupplierId] = useState<number>(
    purchase?.supplierId ?? (suppliers[0]?.id || 1),
  );
  const [purchaseDate, setPurchaseDate] = useState(
    purchase?.purchaseDate ?? "2026-10-28",
  );
  const [expectedDate, setExpectedDate] = useState(
    purchase?.expectedDate ?? "2026-11-15",
  );
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState(
    purchase?.supplierInvoiceNumber ?? "",
  );
  const [warehouseId, setWarehouseId] = useState<number>(
    purchase?.warehouseId ?? (warehouses[0]?.id || 1),
  );
  const [status, setStatus] = useState<PurchaseStatus>(
    purchase?.status ?? "DRAFT",
  );
  const [additionalCharges, setAdditionalCharges] = useState(
    purchase?.additionalCharges !== undefined
      ? String(purchase.additionalCharges)
      : "0",
  );
  const [amountPaid, setAmountPaid] = useState(
    purchase?.amountPaid !== undefined ? String(purchase.amountPaid) : "0",
  );
  const [notes, setNotes] = useState(purchase?.notes ?? "");

  const [items, setItems] = useState<PurchaseItem[]>(
    purchase?.items ?? [
      {
        id: 1,
        productId: products[0]?.id || 1,
        sku: products[0]?.sku || "BED-001",
        productName: products[0]?.name || "Cotton Bedsheet Set - Queen",
        quantity: 10,
        unitCost: products[0]?.costPrice || 120,
        discount: 0,
        taxRate: 0,
        lineTotal: (products[0]?.costPrice || 120) * 10,
        receivedQuantity: 0,
      },
    ],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const calculateLineTotal = (
    qty: number,
    cost: number,
    disc: number,
    tax: number,
  ) => {
    const base = Math.max(0, qty * cost - disc);
    const taxAmount = base * (tax / 100);
    return Math.round((base + taxAmount) * 100) / 100;
  };

  const handleProductSelect = (index: number, pId: number) => {
    const selectedProd = products.find((p) => p.id === pId);
    if (!selectedProd) return;

    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const lineTotal = calculateLineTotal(
          item.quantity,
          selectedProd.costPrice,
          item.discount,
          item.taxRate,
        );
        return {
          ...item,
          productId: selectedProd.id,
          sku: selectedProd.sku,
          productName: selectedProd.name,
          unitCost: selectedProd.costPrice,
          lineTotal,
        };
      }),
    );
  };

  const updateItem = (
    index: number,
    field: "quantity" | "unitCost" | "discount" | "taxRate",
    value: number,
  ) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        const lineTotal = calculateLineTotal(
          updated.quantity,
          updated.unitCost,
          updated.discount,
          updated.taxRate,
        );
        return { ...updated, lineTotal };
      }),
    );
  };

  const addItem = () => {
    const firstProd = products[0];
    const newItem: PurchaseItem = {
      id: Date.now(),
      productId: firstProd?.id || 1,
      sku: firstProd?.sku || "CHR-001",
      productName: firstProd?.name || "Luna Accent Chair",
      quantity: 1,
      unitCost: firstProd?.costPrice || 280,
      discount: 0,
      taxRate: 0,
      lineTotal: firstProd?.costPrice || 280,
      receivedQuantity: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );
  const totalItemDiscount = items.reduce(
    (sum, item) => sum + item.discount,
    0,
  );
  const totalItemTax = items.reduce((sum, item) => {
    const base = Math.max(0, item.quantity * item.unitCost - item.discount);
    return sum + base * (item.taxRate / 100);
  }, 0);
  const additionalChargesNum = Number(additionalCharges) || 0;
  const grandTotal = Math.round(
    (subtotal - totalItemDiscount + totalItemTax + additionalChargesNum) * 100,
  ) / 100;
  const amountPaidNum = Number(amountPaid) || 0;
  const balanceDue = Math.max(0, Math.round((grandTotal - amountPaidNum) * 100) / 100);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!purchaseNumber.trim()) {
      newErrors.purchaseNumber = "Purchase number is required.";
    }
    if (!supplierId) {
      newErrors.supplierId = "Supplier must be selected.";
    }
    if (!warehouseId) {
      newErrors.warehouseId = "Warehouse must be selected.";
    }
    if (items.length === 0) {
      newErrors.items = "At least one product item is required.";
    }

    const invalidItem = items.some(
      (item) => item.quantity <= 0 || item.unitCost < 0,
    );
    if (invalidItem) {
      newErrors.items = "All items must have valid quantity > 0 and unit cost >= 0.";
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

    const selectedSupplier = suppliers.find((s) => s.id === Number(supplierId));
    const selectedWarehouse = warehouses.find((w) => w.id === Number(warehouseId));

    const payload: Purchase = {
      id: purchase?.id || Date.now(),
      purchaseNumber,
      supplierId: Number(supplierId),
      supplierName: selectedSupplier?.companyName || selectedSupplier?.contactPerson || "Supplier",
      purchaseDate,
      expectedDate,
      supplierInvoiceNumber: supplierInvoiceNumber.trim(),
      warehouseId: Number(warehouseId),
      warehouseName: selectedWarehouse?.name || "Main Warehouse",
      status,
      items,
      subtotal,
      discount: totalItemDiscount,
      tax: totalItemTax,
      additionalCharges: additionalChargesNum,
      grandTotal,
      amountPaid: amountPaidNum,
      balanceDue,
      notes: notes.trim(),
      createdAt: purchase?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Purchase order submitted payload:", payload);

    setFeedbackMessage(
      isEdit
        ? "Purchase Order changes validated. Note: Backend API persistence is pending implementation."
        : `Purchase Order ${purchaseNumber} created with ${items.length} line item(s). Note: Backend API persistence is pending implementation.`,
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/purchases"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
            aria-label="Back to purchases"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isEdit
                ? `Update order specifications for ${purchase?.purchaseNumber}.`
                : "Procure inventory from authorized suppliers into destination warehouses."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/purchases"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="purchase-form"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Purchase Order"}
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

      <form id="purchase-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details Card */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Order Information</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Supplier identity, destination warehouse, and reference dates.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="po-number">
                Purchase Order # <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="po-number"
                className="form-input font-mono uppercase"
                value={purchaseNumber}
                onChange={(e) => setPurchaseNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="supplier-select">
                Supplier <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                id="supplier-select"
                className="form-input"
                value={supplierId}
                onChange={(e) => setSupplierId(Number(e.target.value))}
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName || s.contactPerson} ({s.supplierCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="warehouse-select">
                Receiving Warehouse <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                id="warehouse-select"
                className="form-input"
                value={warehouseId}
                onChange={(e) => setWarehouseId(Number(e.target.value))}
                required
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.warehouseCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="purchase-date">
                Order Date <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="purchase-date"
                type="date"
                className="form-input"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="expected-date">
                Expected Delivery Date
              </label>
              <input
                id="expected-date"
                type="date"
                className="form-input"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="vendor-invoice">
                Supplier Invoice / Ref #
              </label>
              <input
                id="vendor-invoice"
                className="form-input"
                value={supplierInvoiceNumber}
                onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-AHM-9821"
              />
            </div>
          </div>
        </section>

        {/* Product Items Table Card */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[var(--primary)]">
                <Package size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Purchase Items</h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Select catalog products, purchase quantities, unit costs, and discounts.
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

          {errors.items && (
            <div className="border-b border-red-200 bg-red-50 px-5 py-2 text-xs text-[var(--danger)]">
              {errors.items}
            </div>
          )}

          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-[var(--border-light)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="pb-3 font-medium">Product / SKU</th>
                  <th className="pb-3 font-medium w-24">Quantity</th>
                  <th className="pb-3 font-medium w-32">Unit Cost ($)</th>
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
                        value={item.unitCost}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitCost",
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

        {/* Totals & Financials Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Notes & Status */}
          <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold">Workflow Status & Notes</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="po-status">
                Order Status
              </label>
              <select
                id="po-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as PurchaseStatus)}
              >
                <option value="DRAFT">DRAFT (Does not affect stock)</option>
                <option value="ORDERED">ORDERED (Pending delivery)</option>
                <option value="RECEIVED">RECEIVED (Increases on-hand stock)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Note: In stock-accounting rules, only RECEIVED status commits inventory into the warehouse.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="po-notes">
                Delivery Instructions & Notes
              </label>
              <textarea
                id="po-notes"
                className="min-h-[100px] w-full resize-y rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Logistics contacts, freight carrier, dock receiving instructions..."
              />
            </div>
          </section>

          {/* Calculations Summary */}
          <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold">Summary & Landed Costs</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Items Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Item Discounts</span>
              <span className="font-medium text-emerald-700">-${totalItemDiscount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Taxes</span>
              <span className="font-medium">${totalItemTax.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Freight & Additional Charges</span>
              <div className="w-28">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input h-8 text-right text-xs"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-[var(--border-light)] pt-2 flex items-center justify-between text-base font-semibold">
              <span>Grand Total</span>
              <span className="text-[var(--primary)]">${grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--border-light)]">
              <span className="text-[var(--muted)]">Amount Paid</span>
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
              <span className="text-[var(--muted)]">Balance Due</span>
              <span className={balanceDue > 0 ? "text-amber-700" : "text-emerald-700"}>
                ${balanceDue.toFixed(2)}
              </span>
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 rounded-xl border border-[var(--border)] bg-white p-4">
          <Link
            href="/purchases"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
