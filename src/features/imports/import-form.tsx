"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Package,
  Plus,
  Save,
  Ship,
  Sparkles,
  Trash2,
  UploadCloud,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { products } from "@/features/products/product.data";
import { purchases } from "@/features/purchases/purchase.data";
import { suppliers } from "@/features/suppliers/supplier.data";
import { warehouses } from "@/features/warehouses/warehouse.data";
import {
  calculateLandedCosts,
  initialImports,
} from "./import.data";
import type {
  AllocationMethod,
  ExpenseType,
  ImportExpenseHead,
  ImportItem,
  ImportShipment,
  ImportStatus,
} from "./import.types";

interface ImportFormProps {
  mode: "create" | "edit";
  importData?: ImportShipment;
}

export function ImportForm({ mode, importData }: ImportFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [importNumber, setImportNumber] = useState(
    importData?.importNumber ?? `IMP-2026-${String(Math.floor(Math.random() * 900 + 104)).padStart(3, "0")}`
  );
  const [supplierId, setSupplierId] = useState<number>(
    importData?.supplierId ?? 2
  );
  const [purchaseId, setPurchaseId] = useState<number | undefined>(
    importData?.purchaseId
  );
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState(
    importData?.supplierInvoiceNumber ?? ""
  );
  const [shipmentReference, setShipmentReference] = useState(
    importData?.shipmentReference ?? ""
  );
  const [importDate, setImportDate] = useState(
    importData?.importDate ?? "2026-10-28"
  );
  const [warehouseId, setWarehouseId] = useState<number>(
    importData?.warehouseId ?? 1
  );
  const [status, setStatus] = useState<ImportStatus>(
    importData?.status ?? "DRAFT"
  );
  const [notes, setNotes] = useState(importData?.notes ?? "");

  // Mock document scanning state
  const [mockFileName, setMockFileName] = useState<string | null>(
    importData?.documentName ?? null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Products lines
  const [items, setItems] = useState<
    Omit<ImportItem, "allocatedExpense" | "totalLandedCost" | "landedUnitCost">[]
  >(
    importData?.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      sku: i.sku,
      productName: i.productName,
      quantity: i.quantity,
      purchaseUnitCost: i.purchaseUnitCost,
      purchaseTotalCost: i.purchaseTotalCost,
    })) ?? [
      {
        id: 1,
        productId: 6,
        sku: "TBL-003",
        productName: "Teak Dining Table",
        quantity: 10,
        purchaseUnitCost: 650,
        purchaseTotalCost: 6500,
      },
    ]
  );

  // Additional Expense Heads
  const [expenseHeads, setExpenseHeads] = useState<ImportExpenseHead[]>(
    importData?.expenseHeads ?? [
      {
        id: 1,
        type: "FREIGHT",
        description: "Ocean Freight / Port Drayage",
        amount: 1500,
        allocationMethod: "BY_VALUE",
      },
      {
        id: 2,
        type: "CUSTOMS",
        description: "US Customs & Import Tariff",
        amount: 600,
        allocationMethod: "BY_VALUE",
      },
    ]
  );

  // Success / error feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Deterministic calculation
  const computedItems = calculateLandedCosts(items, expenseHeads);
  const totalProductCost = items.reduce((sum, item) => sum + item.purchaseTotalCost, 0);
  const totalAdditionalCosts = expenseHeads.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalLandedCost = totalProductCost + totalAdditionalCosts;

  // Handler for linking a purchase order
  const handlePurchaseSelect = (poId: number) => {
    setPurchaseId(poId);
    const po = purchases.find((p) => p.id === poId);
    if (po) {
      setSupplierId(po.supplierId);
      if (po.supplierInvoiceNumber) setSupplierInvoiceNumber(po.supplierInvoiceNumber);
      setWarehouseId(po.warehouseId);

      // Populate items from the purchase
      const poItems = po.items.map((pi, idx) => ({
        id: idx + 1,
        productId: pi.productId,
        sku: pi.sku,
        productName: pi.productName,
        quantity: pi.quantity,
        purchaseUnitCost: pi.unitCost,
        purchaseTotalCost: pi.quantity * pi.unitCost,
      }));
      setItems(poItems);
    }
  };

  // Mock Document Drop / OCR Parser
  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".csv")) {
      setErrorBanner("Unsupported document format. Please upload a PDF or Excel/CSV supplier commercial invoice.");
      return;
    }

    setErrorBanner(null);
    setIsScanning(true);
    setMockFileName(file.name);
    setScanMessage("Parsing invoice contents via local simulated OCR extractor...");

    setTimeout(() => {
      setIsScanning(false);
      setScanMessage("Extraction completed. Review and verify values below.");
      // Automatically enrich with realistic extracted freight & tariff values
      setSupplierInvoiceNumber(`INV-US-${Math.floor(Math.random() * 8000 + 1000)}`);
      setStatus("REVIEW_REQUIRED");
      setExpenseHeads([
        {
          id: 1,
          type: "FREIGHT",
          description: "International Carrier Freight (Extracted)",
          amount: 1850,
          allocationMethod: "BY_VALUE",
        },
        {
          id: 2,
          type: "CUSTOMS",
          description: "CBP Customs Entry Duty (Extracted)",
          amount: 720,
          allocationMethod: "BY_VALUE",
        },
        {
          id: 3,
          type: "PORT_HANDLING",
          description: "Terminal Clearance & Demurrage (Extracted)",
          amount: 340,
          allocationMethod: "BY_QUANTITY",
        },
      ]);
    }, 1200);
  };

  // Item row operations
  const handleAddItem = () => {
    const firstProduct = products[0];
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        productId: firstProduct.id,
        sku: firstProduct.sku,
        productName: firstProduct.name,
        quantity: 1,
        purchaseUnitCost: firstProduct.costPrice,
        purchaseTotalCost: firstProduct.costPrice,
      },
    ]);
  };

  const handleProductChange = (index: number, newProductId: number) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        purchaseUnitCost: prod.costPrice,
        purchaseTotalCost: copy[index].quantity * prod.costPrice,
      };
      return copy;
    });
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    const quantity = Math.max(1, qty);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        quantity,
        purchaseTotalCost: quantity * copy[index].purchaseUnitCost,
      };
      return copy;
    });
  };

  const handleItemCostChange = (index: number, cost: number) => {
    const purchaseUnitCost = Math.max(0, cost);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        purchaseUnitCost,
        purchaseTotalCost: copy[index].quantity * purchaseUnitCost,
      };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setErrorBanner("An import shipment must contain at least one line item.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Expense row operations
  const handleAddExpense = () => {
    setExpenseHeads((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "FREIGHT",
        description: "In-Transit Shipping Charge",
        amount: 250,
        allocationMethod: "BY_VALUE",
      },
    ]);
  };

  const handleExpenseChange = (
    index: number,
    field: keyof ImportExpenseHead,
    val: string | number
  ) => {
    setExpenseHeads((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveExpense = (index: number) => {
    setExpenseHeads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (items.length === 0) {
      setErrorBanner("Please add at least one product item to calculate landed cost.");
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    const purchase = purchases.find((p) => p.id === purchaseId);

    const updatedShipment: ImportShipment = {
      id: importData?.id ?? initialImports.length + 1,
      importNumber,
      supplierId,
      supplierName: supplier?.companyName ?? "Supplier",
      supplierInvoiceNumber: supplierInvoiceNumber.trim() || undefined,
      purchaseId,
      purchaseNumber: purchase?.purchaseNumber,
      shipmentReference: shipmentReference.trim() || undefined,
      importDate,
      warehouseId,
      warehouseName: warehouse?.name ?? "Warehouse",
      status,
      items: computedItems,
      expenseHeads,
      totalProductCost,
      totalAdditionalCosts,
      totalLandedCost,
      documentName: mockFileName ?? undefined,
      documentExtracted: Boolean(mockFileName),
      notes: notes.trim() || undefined,
      createdAt: importData?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update shared array
    const existingIndex = initialImports.findIndex((i) => i.id === updatedShipment.id);
    if (existingIndex >= 0) {
      initialImports[existingIndex] = updatedShipment;
    } else {
      initialImports.unshift(updatedShipment);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      router.push("/imports");
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Link href="/imports" className="hover:text-[var(--primary)] flex items-center gap-1">
              <ArrowLeft size={13} />
              Imports
            </Link>
            <span>/</span>
            <span>{isEdit ? `Edit ${importNumber}` : "New Import Shipment"}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {isEdit ? `Edit Import: ${importNumber}` : "Calculate Landed Cost / Import"}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Allocate freight, customs duties, port charges, and handling costs across products.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/imports"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)] active:scale-95"
          >
            <Save size={16} />
            <span>{isEdit ? "Update Import" : "Save Landed Cost"}</span>
          </button>
        </div>
      </div>

      {/* Success banner */}
      {savedSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>Import shipment and allocated landed costs saved successfully! Redirecting...</span>
        </div>
      )}

      {/* Error banner */}
      {errorBanner && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Step 1: Mock Document Drop & OCR Parser */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-4">
          <Ship size={18} className="text-[var(--primary)]" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Document Import & Supplier Invoice Scan
          </h2>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            Frontend Mock Scanner
          </span>
        </div>

        <div className="mt-4">
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--muted-background)]/50 p-6 text-center transition hover:border-[var(--primary)]/60">
            <UploadCloud size={36} className="text-[var(--primary)] mb-2" />
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Upload Supplier Invoice / Bill of Lading (PDF, Excel, CSV)
            </p>
            <p className="mt-1 text-xs text-[var(--muted)] max-w-md">
              Frontend OCR preview mode: Drop a sample file to test simulated field extraction and automatic cost allocation. No files are sent to any external server.
            </p>

            <input
              type="file"
              onChange={handleSimulatedFileUpload}
              accept=".pdf,.xlsx,.csv"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {mockFileName && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-emerald-700" />
                <div>
                  <p className="font-semibold text-emerald-900">{mockFileName}</p>
                  <p className="text-emerald-700">{scanMessage || "Document attached to shipment record."}</p>
                </div>
              </div>
              <span className="rounded bg-emerald-200 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                EXTRACTED
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Step 2: Shipment & Supplier Info */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)] border-b border-[var(--border-light)] pb-4">
          Shipment Identification & Destination
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Import Reference #</label>
            <input
              type="text"
              value={importNumber}
              onChange={(e) => setImportNumber(e.target.value)}
              required
              className="form-input mt-1.5 w-full font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Link Existing Purchase Order</label>
            <select
              value={purchaseId ?? ""}
              onChange={(e) => handlePurchaseSelect(Number(e.target.value))}
              className="form-input mt-1.5 w-full text-sm"
            >
              <option value="">-- Direct Import (No PO Link) --</option>
              {purchases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.purchaseNumber} — {p.supplierName} (${p.grandTotal.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Supplier / Vendor</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              className="form-input mt-1.5 w-full text-sm"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName} ({s.supplierCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Supplier Invoice #</label>
            <input
              type="text"
              value={supplierInvoiceNumber}
              onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
              placeholder="e.g. RTE-INV-99412"
              className="form-input mt-1.5 w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Bill of Lading / Tracking #</label>
            <input
              type="text"
              value={shipmentReference}
              onChange={(e) => setShipmentReference(e.target.value)}
              placeholder="e.g. BOL-MSC-774129"
              className="form-input mt-1.5 w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Destination Warehouse</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(Number(e.target.value))}
              className="form-input mt-1.5 w-full text-sm"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Import Date</label>
            <input
              type="date"
              value={importDate}
              onChange={(e) => setImportDate(e.target.value)}
              className="form-input mt-1.5 w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Workflow Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ImportStatus)}
              className="form-input mt-1.5 w-full text-sm font-semibold"
            >
              <option value="DRAFT">Draft Estimate</option>
              <option value="PROCESSING">Processing In-Transit</option>
              <option value="REVIEW_REQUIRED">Review Required</option>
              <option value="COMPLETED">Completed (Valuation Locked)</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      {/* Step 3: Additional Import Expense Heads (Freight, Customs, Port Handling) */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-light)] pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Import Expense Heads & Allocation Rules
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Assign how freight, customs, insurance, and handling charges are allocated across line items.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddExpense}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-light)]"
          >
            <Plus size={14} />
            <span>Add Expense Head</span>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {expenseHeads.map((expense, idx) => (
            <div
              key={expense.id}
              className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted-background)]/30 p-3.5 sm:grid-cols-12 sm:items-center"
            >
              <div className="sm:col-span-3">
                <label className="text-[11px] font-semibold text-[var(--muted)]">Expense Category</label>
                <select
                  value={expense.type}
                  onChange={(e) => handleExpenseChange(idx, "type", e.target.value as ExpenseType)}
                  className="form-input mt-1 w-full text-xs"
                >
                  <option value="FREIGHT">Freight / Logistics</option>
                  <option value="CUSTOMS">Customs Duty & Tariffs</option>
                  <option value="INSURANCE">Marine Insurance</option>
                  <option value="PORT_HANDLING">Port / Terminal Handling</option>
                  <option value="BROKERAGE">Customs Brokerage</option>
                  <option value="OTHER">Other Expense</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] font-semibold text-[var(--muted)]">Description</label>
                <input
                  type="text"
                  value={expense.description}
                  onChange={(e) => handleExpenseChange(idx, "description", e.target.value)}
                  placeholder="e.g. Ocean Container Freight"
                  className="form-input mt-1 w-full text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[var(--muted)]">Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={expense.amount}
                  onChange={(e) => handleExpenseChange(idx, "amount", parseFloat(e.target.value) || 0)}
                  className="form-input mt-1 w-full text-xs text-right font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[var(--muted)]">Allocation Method</label>
                <select
                  value={expense.allocationMethod}
                  onChange={(e) => handleExpenseChange(idx, "allocationMethod", e.target.value as AllocationMethod)}
                  className="form-input mt-1 w-full text-xs"
                >
                  <option value="BY_VALUE">By Item Value</option>
                  <option value="BY_QUANTITY">By Item Quantity</option>
                  <option value="EQUAL">Equal Split</option>
                </select>
              </div>

              <div className="flex sm:col-span-1 justify-end pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleRemoveExpense(idx)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2 text-sm font-semibold text-[var(--foreground)]">
            <span>Total Additional Expenses: ${totalAdditionalCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </section>

      {/* Step 4: Imported Line Items & Live Landed Cost Allocation Preview */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-light)] pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Product Lines & Landed Unit Cost Analysis
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Review how additional expenses increase the unit landed cost of each inventory item.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-light)]"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-left text-slate-600">
                <th className="px-3 py-3 font-semibold">Product / SKU</th>
                <th className="px-3 py-3 text-right font-semibold w-24">Quantity</th>
                <th className="px-3 py-3 text-right font-semibold w-32">Unit Purchase Cost</th>
                <th className="px-3 py-3 text-right font-semibold w-32">Base Total</th>
                <th className="px-3 py-3 text-right font-semibold w-32 text-amber-700">Allocated Expense</th>
                <th className="px-3 py-3 text-right font-semibold w-32 text-emerald-800">Total Landed Cost</th>
                <th className="px-3 py-3 text-right font-semibold w-32 text-emerald-800">Landed Unit Cost</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>

            <tbody>
              {computedItems.map((item, idx) => {
                const markupPercent = item.purchaseUnitCost > 0
                  ? (((item.landedUnitCost - item.purchaseUnitCost) / item.purchaseUnitCost) * 100).toFixed(1)
                  : "0.0";

                return (
                  <tr key={item.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-slate-50/60">
                    <td className="px-3 py-3">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                        className="form-input w-full text-xs font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(idx, parseInt(e.target.value) || 1)}
                        className="form-input w-20 text-right text-xs"
                      />
                    </td>

                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.purchaseUnitCost}
                        onChange={(e) => handleItemCostChange(idx, parseFloat(e.target.value) || 0)}
                        className="form-input w-28 text-right text-xs font-mono"
                      />
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-medium text-slate-700">
                      ${item.purchaseTotalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-semibold text-amber-700">
                      +${item.allocatedExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">
                      ${item.totalLandedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-3 py-3 text-right">
                      <p className="font-mono font-bold text-emerald-800">
                        ${item.landedUnitCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        (+{markupPercent}%)
                      </p>
                    </td>

                    <td className="px-2 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="mt-6 flex flex-col items-end gap-1.5 border-t border-[var(--border)] pt-4 text-sm">
          <div className="flex w-64 justify-between text-xs text-slate-600">
            <span>Base Goods Purchase Cost:</span>
            <span className="font-mono font-semibold">${totalProductCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex w-64 justify-between text-xs text-amber-700">
            <span>Additional Import Expenses:</span>
            <span className="font-mono font-semibold">+${totalAdditionalCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex w-64 justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
            <span>Total Landed Valuation:</span>
            <span className="font-mono text-emerald-800">${totalLandedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </section>

      {/* Step 5: Notes & Confirmation */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <label className="text-xs font-semibold text-[var(--muted)]">Shipment & Customs Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Container cleared via Oakland terminal with zero demurrage penalties..."
          className="form-input mt-1.5 w-full text-xs"
        />

        <div className="mt-5 flex justify-end gap-3">
          <Link
            href="/imports"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)] active:scale-95"
          >
            <Save size={16} />
            <span>Save Landed Cost Calculation</span>
          </button>
        </div>
      </section>
    </form>
  );
}
