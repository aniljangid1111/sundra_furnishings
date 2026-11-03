"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  Ship,
  Warehouse,
} from "lucide-react";
import { getImportByIdApi } from "@/lib/api/import.api";
import type { ImportShipment } from "@/features/imports/import.types";

interface ViewImportPageProps {
  params: Promise<{ id: string }>;
}

export default function ViewImportPage({ params }: ViewImportPageProps) {
  const { id } = use(params);
  const [shipment, setShipment] = useState<ImportShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShipment() {
      setIsLoading(true);
      try {
        const res = await getImportByIdApi(id);
        if (res.success && res.data) {
          setShipment(res.data);
        } else {
          setShipment(null);
        }
      } catch (err) {
        console.error("Failed to load import:", err);
        setShipment(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadShipment();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-[var(--muted)]">
        <Loader2 size={20} className="mr-2 animate-spin text-[var(--primary)]" />
        Loading import shipment...
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-8 text-center">
        <p className="text-base font-semibold">Shipment Not Found</p>
        <p className="mt-1 text-xs text-[var(--muted)]">The requested import shipment ID does not exist.</p>
        <Link href="/imports" className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline">
          <ArrowLeft size={14} /> Back to Imports
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REVIEW_REQUIRED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Link href="/imports" className="hover:text-[var(--primary)] flex items-center gap-1">
              <ArrowLeft size={13} />
              Imports
            </Link>
            <span>/</span>
            <span className="font-mono font-medium text-[var(--foreground)]">{shipment.importNumber}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {shipment.importNumber}
            </h1>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(shipment.status)}`}>
              {shipment.status.replace("_", " ")}
            </span>
            {shipment.documentName && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <FileText size={12} />
                <span>{shipment.documentName}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/imports"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted-background)]"
          >
            Back to List
          </Link>

          {shipment.status !== "COMPLETED" && (
            <Link
              href={`/imports/edit/${shipment.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
            >
              <Edit3 size={15} />
              <span>Edit Shipment</span>
            </Link>
          )}
        </div>
      </div>

      {/* Meta context cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Supplier / Vendor</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)] truncate">
            {shipment.supplierName || "Direct Vendor"}
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Inv: {shipment.supplierInvoiceNumber || "N/A"}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Destination Warehouse</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)] truncate">
            {shipment.warehouseName}
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Date: {shipment.importDate}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">PO Reference</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)] truncate">
            {shipment.purchaseNumber || "Direct Shipment"}
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">BOL: {shipment.shipmentReference || "N/A"}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Total Landed Valuation</p>
          <p className="mt-1 text-sm font-bold font-mono text-emerald-800">
            ${Number(shipment.totalLandedCost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            +${Number(shipment.totalAdditionalCosts || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} freight & duty
          </p>
        </div>
      </div>

      {/* Line Items Table with Landed Cost Breakdown */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border-light)] p-4">
          <h2 className="text-base font-semibold">Landed Cost Allocation per Product SKU</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-[var(--muted-background)]/50 text-xs font-semibold text-[var(--muted)]">
              <tr className="border-b border-[var(--border-light)] text-left">
                <th className="px-5 py-3">Product Name & SKU</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-right">FOB Unit Cost</th>
                <th className="px-4 py-3 text-right">Total FOB</th>
                <th className="px-4 py-3 text-right">Allocated Freight/Duty</th>
                <th className="px-4 py-3 text-right">Total Landed Cost</th>
                <th className="px-5 py-3 text-right font-bold text-emerald-800">Landed Unit Cost</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-light)]">
              {(shipment.items || []).map((item) => (
                <tr key={item.id} className="hover:bg-[var(--muted-background)]/30">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[var(--foreground)]">{item.productName}</p>
                    <p className="font-mono text-xs text-[var(--muted)]">{item.sku}</p>
                  </td>
                  <td className="px-4 py-4 text-center font-semibold">{item.quantity}</td>
                  <td className="px-4 py-4 text-right font-mono text-xs">${Number(item.purchaseUnitCost || 0).toFixed(2)}</td>
                  <td className="px-4 py-4 text-right font-mono text-xs">${Number(item.purchaseTotalCost || 0).toFixed(2)}</td>
                  <td className="px-4 py-4 text-right font-mono text-xs text-amber-700">+${Number(item.allocatedExpense || 0).toFixed(2)}</td>
                  <td className="px-4 py-4 text-right font-mono text-xs font-semibold">${Number(item.totalLandedCost || 0).toFixed(2)}</td>
                  <td className="px-5 py-4 text-right font-mono text-sm font-bold text-emerald-800">
                    ${Number(item.landedUnitCost || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
