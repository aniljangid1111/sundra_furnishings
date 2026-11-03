"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Building2,
  Loader2,
  Package,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import type {
  Purchase,
  PurchaseItem,
  PurchaseStatus,
} from "./purchase.types";
import type { Supplier } from "@/features/suppliers/supplier.types";
import type { Warehouse } from "@/features/warehouses/warehouse.types";
import type { Product } from "@/features/products/product.types";
import { getSuppliersApi } from "@/lib/api/supplier.api";
import { getWarehousesApi } from "@/lib/api/warehouse.api";
import { getProductsApi } from "@/lib/api/product.api";
import { createPurchaseApi, updatePurchaseApi } from "@/lib/api/purchase.api";

interface PurchaseFormProps {
  mode: "create" | "edit";
  purchase?: Purchase;
}

export function PurchaseForm({ mode, purchase }: PurchaseFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
  const [warehousesList, setWarehousesList] = useState<Warehouse[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  const [purchaseNumber, setPurchaseNumber] = useState(
    purchase?.purchaseNumber ?? ""
  );
  const [supplierId, setSupplierId] = useState<number>(
    purchase?.supplierId ?? 0
  );
  const [purchaseDate, setPurchaseDate] = useState(
    purchase?.purchaseDate
      ? purchase.purchaseDate.split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [expectedDate, setExpectedDate] = useState(
    purchase?.expectedDate ? purchase.expectedDate.split("T")[0] : ""
  );
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState(
    purchase?.supplierInvoiceNumber ?? ""
  );
  const [containerNumber, setContainerNumber] = useState(
    purchase?.containerNumber ?? ""
  );
  const [warehouseId, setWarehouseId] = useState<number>(
    purchase?.warehouseId ?? 0
  );
  const [status, setStatus] = useState<PurchaseStatus>(
    purchase?.status ?? "DRAFT"
  );
  const [additionalCharges, setAdditionalCharges] = useState(
    purchase?.additionalCharges !== undefined
      ? String(purchase.additionalCharges)
      : "0"
  );
  const [amountPaid, setAmountPaid] = useState(
    purchase?.amountPaid !== undefined ? String(purchase.amountPaid) : "0"
  );
  const [notes, setNotes] = useState(purchase?.notes ?? "");

  const [items, setItems] = useState<PurchaseItem[]>(purchase?.items ?? []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load live master data
  useEffect(() => {
    Promise.all([
      getSuppliersApi({ limit: "all" }),
      getWarehousesApi({ limit: "all" }),
      getProductsApi({ limit: "all" }),
    ])
      .then(([suppRes, whRes, prodRes]) => {
        if (suppRes.success && suppRes.data) {
          setSuppliersList(suppRes.data);
          if (!supplierId && suppRes.data.length > 0) {
            setSupplierId(suppRes.data[0].id);
          }
        }
        if (whRes.success && whRes.data) {
          setWarehousesList(whRes.data);
          if (!warehouseId && whRes.data.length > 0) {
            setWarehouseId(whRes.data[0].id);
          }
        }
        if (prodRes.success && prodRes.data) {
          setProductsList(prodRes.data);
          if (items.length === 0 && prodRes.data.length > 0) {
            const first = prodRes.data[0];
            setItems([
              {
                id: 1,
                productId: first.id,
                sku: first.sku,
                productName: first.name,
                quantity: 1,
                unitCost: Number(first.costPrice || 0),
                discount: 0,
                taxRate: Number(first.taxRate || 0),
                lineTotal: Number(first.costPrice || 0),
                receivedQuantity: 0,
              },
            ]);
          }
        }
      })
      .catch((err) => console.error("Failed to load PO dependencies", err));
  }, []);

  const calculateLineTotal = (
    qty: number,
    cost: number,
    disc: number,
    tax: number
  ) => {
    const base = Math.max(0, qty * cost - disc);
    const taxAmount = base * (tax / 100);
    return Math.round((base + taxAmount) * 100) / 100;
  };

  const handleProductSelect = (index: number, pId: number) => {
    const selectedProd = productsList.find((p) => p.id === pId);
    if (!selectedProd) return;

    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const lineTotal = calculateLineTotal(
          item.quantity,
          Number(selectedProd.costPrice || 0),
          item.discount,
          item.taxRate
        );
        return {
          ...item,
          productId: selectedProd.id,
          sku: selectedProd.sku,
          productName: selectedProd.name,
          unitCost: Number(selectedProd.costPrice || 0),
          lineTotal,
        };
      })
    );
  };

  const handleItemChange = (
    index: number,
    field: "quantity" | "unitCost" | "discount" | "taxRate",
    value: number
  ) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        const lineTotal = calculateLineTotal(
          field === "quantity" ? value : updated.quantity,
          field === "unitCost" ? value : updated.unitCost,
          field === "discount" ? value : updated.discount,
          field === "taxRate" ? value : updated.taxRate
        );
        return { ...updated, lineTotal };
      })
    );
  };

  const addItem = () => {
    const firstProd = productsList[0];
    const newIdx = items.length + 1;
    setItems((prev) => [
      ...prev,
      {
        id: newIdx,
        productId: firstProd?.id || 1,
        sku: firstProd?.sku || "PROD",
        productName: firstProd?.name || "Product",
        quantity: 1,
        unitCost: Number(firstProd?.costPrice || 0),
        discount: 0,
        taxRate: Number(firstProd?.taxRate || 0),
        lineTotal: Number(firstProd?.costPrice || 0),
        receivedQuantity: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );
  const totalItemDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const totalItemTax = items.reduce((sum, item) => {
    const base = Math.max(0, item.quantity * item.unitCost - item.discount);
    return sum + base * (item.taxRate / 100);
  }, 0);

  const additionalChargesNum = Number(additionalCharges) || 0;
  const amountPaidNum = Number(amountPaid) || 0;

  const grandTotal = Math.round(
    (subtotal - totalItemDiscount + totalItemTax + additionalChargesNum) * 100
  ) / 100;
  const balanceDue = Math.max(0, Math.round((grandTotal - amountPaidNum) * 100) / 100);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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
      (item) => item.quantity <= 0 || item.unitCost < 0
    );
    if (invalidItem) {
      newErrors.items =
        "All items must have valid quantity > 0 and unit cost >= 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    const selectedSupplier = suppliersList.find(
      (s) => s.id === Number(supplierId)
    );
    const selectedWarehouse = warehousesList.find(
      (w) => w.id === Number(warehouseId)
    );

    const payload = {
      purchaseNumber: purchaseNumber.trim() || undefined,
      supplierId: Number(supplierId),
      supplierName:
        selectedSupplier?.companyName ||
        selectedSupplier?.contactPerson ||
        undefined,
      purchaseDate,
      expectedDate: expectedDate || undefined,
      supplierInvoiceNumber: supplierInvoiceNumber.trim() || undefined,
      containerNumber: containerNumber.trim() || undefined,
      warehouseId: Number(warehouseId),
      warehouseName: selectedWarehouse?.name || undefined,
      status,
      items: items.map((i) => ({
        productId: i.productId,
        sku: i.sku,
        productName: i.productName,
        quantity: i.quantity,
        unitCost: i.unitCost,
        discount: i.discount,
        taxRate: i.taxRate,
        lineTotal: i.lineTotal,
        receivedQuantity: i.receivedQuantity,
      })),
      subtotal,
      discount: totalItemDiscount,
      tax: totalItemTax,
      additionalCharges: additionalChargesNum,
      grandTotal,
      amountPaid: amountPaidNum,
      balanceDue,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit && purchase?.id) {
        await updatePurchaseApi(purchase.id, payload);
      } else {
        await createPurchaseApi(payload);
      }

      router.push("/purchases");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to save purchase order. Please verify all inputs."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

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
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Purchase Order"}
          </button>
        </div>
      </div>

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
                Purchase Order #
              </label>
              <input
                id="po-number"
                className="form-input font-mono uppercase"
                value={purchaseNumber}
                onChange={(e) => setPurchaseNumber(e.target.value)}
                placeholder="Auto-generated if left blank"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                <option value="">Select Supplier</option>
                {suppliersList.map((s) => (
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
                disabled={isSubmitting}
              >
                <option value="">Select Warehouse</option>
                {warehousesList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.warehouseCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="purchase-date">
                Invoice Date <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="purchase-date"
                type="date"
                className="form-input"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="expected-date">
                Inward Date
              </label>
              <input
                id="expected-date"
                type="date"
                className="form-input"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="container-number">
                Container No.
              </label>
              <input
                id="container-number"
                className="form-input"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value)}
                placeholder="e.g. MSCU-726194-2"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="po-status">
                Status
              </label>
              <select
                id="po-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as PurchaseStatus)}
                disabled={isSubmitting}
              >
                <option value="DRAFT">Draft</option>
                <option value="ORDERED">Ordered</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)] disabled:opacity-50"
            >
              <Plus size={14} /> Add Item
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
                  <th className="pb-3 font-medium w-28">Unit Cost</th>
                  <th className="pb-3 font-medium w-24">Discount ($)</th>
                  <th className="pb-3 font-medium w-24">Tax (%)</th>
                  <th className="pb-3 font-medium text-right w-28">Line Total</th>
                  <th className="pb-3 text-right w-12"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 pr-4">
                      <select
                        className="form-input text-xs"
                        value={item.productId}
                        onChange={(e) =>
                          handleProductSelect(index, Number(e.target.value))
                        }
                        disabled={isSubmitting}
                      >
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 pr-2">
                      <input
                        type="number"
                        min="1"
                        className="form-input text-xs"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </td>

                    <td className="py-3 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input text-xs"
                        value={item.unitCost}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unitCost",
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </td>

                    <td className="py-3 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input text-xs"
                        value={item.discount}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "discount",
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </td>

                    <td className="py-3 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input text-xs"
                        value={item.taxRate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "taxRate",
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </td>

                    <td className="py-3 text-right font-medium text-[var(--foreground)]">
                      ${item.lineTotal.toFixed(2)}
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1 || isSubmitting}
                        className="text-[var(--danger)] hover:opacity-75 disabled:opacity-30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-[var(--border-light)] bg-[#fafcfb] p-5">
            <div className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Item Discounts:</span>
                <span>-${totalItemDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Tax:</span>
                <span>+${totalItemTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Freight / Inward Charges:</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input !h-7 w-24 text-right text-xs"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-base text-[var(--foreground)]">
                <span>Grand Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">Amount Paid:</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input !h-7 w-24 text-right text-xs"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-amber-600">
                <span>Balance Due:</span>
                <span>${balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Notes */}
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="po-notes">
            Procurement & Logistics Notes
          </label>
          <textarea
            id="po-notes"
            className="min-h-[80px] w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--primary)] disabled:opacity-50"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special packing instructions, delivery gate instructions, port forwarding details..."
            disabled={isSubmitting}
          />
        </section>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Link
            href="/purchases"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white! hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
