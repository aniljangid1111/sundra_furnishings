import Link from "next/link";
import { notFound } from "next/navigation";
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
  Package,
  Ship,
  Warehouse,
} from "lucide-react";
import { initialImports } from "@/features/imports/import.data";

interface ViewImportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewImportPage({ params }: ViewImportPageProps) {
  const { id } = await params;

  const shipment = initialImports.find(
    (item) => item.id === Number(id) || item.importNumber.toLowerCase() === id.toLowerCase()
  );

  if (!shipment) {
    notFound();
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
          <p className="text-xs font-medium text-[var(--muted)]">Base Goods Cost</p>
          <p className="mt-1 text-lg font-bold text-slate-800">
            ${shipment.totalProductCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-amber-700 font-medium">
            +${shipment.totalAdditionalCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })} Freight & Duty
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Total Landed Valuation</p>
          <p className="mt-1 text-lg font-bold text-emerald-800">
            ${shipment.totalLandedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-medium">Cost Capitalized into Stock</p>
        </div>
      </div>

      {/* Expense Heads Breakdown */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)] border-b border-[var(--border-light)] pb-4">
          Allocated Expense Heads ({shipment.expenseHeads.length})
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-slate-600">
                <th className="px-4 py-3 font-semibold">Expense Head</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Allocation Method</th>
                <th className="px-4 py-3 text-right font-semibold">Allocated Amount</th>
              </tr>
            </thead>
            <tbody>
              {shipment.expenseHeads.map((exp) => (
                <tr key={exp.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {exp.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{exp.description}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {exp.allocationMethod.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">
                    ${exp.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Items Landed Cost Table */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)] border-b border-[var(--border-light)] pb-4">
          Product Landed Cost Distribution
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-slate-600">
                <th className="px-4 py-3 font-semibold">Item & SKU</th>
                <th className="px-4 py-3 text-right font-semibold">Quantity</th>
                <th className="px-4 py-3 text-right font-semibold">FOB Unit Cost</th>
                <th className="px-4 py-3 text-right font-semibold">Base Total</th>
                <th className="px-4 py-3 text-right font-semibold text-amber-700">Allocated Expenses</th>
                <th className="px-4 py-3 text-right font-semibold text-emerald-800">Total Landed Cost</th>
                <th className="px-4 py-3 text-right font-semibold text-emerald-800">Landed Unit Cost</th>
              </tr>
            </thead>
            <tbody>
              {shipment.items.map((item) => {
                const markup = item.purchaseUnitCost > 0
                  ? (((item.landedUnitCost - item.purchaseUnitCost) / item.purchaseUnitCost) * 100).toFixed(1)
                  : "0.0";

                return (
                  <tr key={item.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[var(--foreground)]">{item.productName}</p>
                      <p className="font-mono text-[11px] text-[var(--muted)]">{item.sku}</p>
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-slate-800">{item.quantity} units</td>

                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      ${item.purchaseUnitCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      ${item.purchaseTotalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-semibold text-amber-700">
                      +${item.allocatedExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ${item.totalLandedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <p className="font-mono font-bold text-emerald-800">
                        ${item.landedUnitCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        (+{markup}%)
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {shipment.notes && (
          <div className="mt-5 rounded-xl border border-[var(--border-light)] bg-[var(--muted-background)]/30 p-4 text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--foreground)]">Shipment & Customs Notes: </span>
            {shipment.notes}
          </div>
        )}
      </section>
    </div>
  );
}
