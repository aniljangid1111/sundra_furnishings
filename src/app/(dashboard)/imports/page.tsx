"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Search,
  Ship,
  Warehouse,
} from "lucide-react";
import { initialImports } from "@/features/imports/import.data";
import type { ImportShipment, ImportStatus } from "@/features/imports/import.types";

export default function ImportsListingPage() {
  const [imports, setImports] = useState<ImportShipment[]>(initialImports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Summary Metrics calculated dynamically
  const totalShipments = imports.length;
  const totalProductCost = imports.reduce((sum, imp) => sum + imp.totalProductCost, 0);
  const totalAdditionalCosts = imports.reduce((sum, imp) => sum + imp.totalAdditionalCosts, 0);
  const totalLandedCost = imports.reduce((sum, imp) => sum + imp.totalLandedCost, 0);

  const filteredImports = imports.filter((imp) => {
    const matchesSearch =
      imp.importNumber.toLowerCase().includes(search.toLowerCase()) ||
      (imp.supplierName && imp.supplierName.toLowerCase().includes(search.toLowerCase())) ||
      (imp.supplierInvoiceNumber && imp.supplierInvoiceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (imp.shipmentReference && imp.shipmentReference.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || imp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            Supply Chain & Logistics
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Imports & Landed Costs
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track overseas and freight shipments, manage document extraction, and allocate landed costs into inventory.
          </p>
        </div>

        <Link
          href="/imports/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
        >
          <Plus size={17} strokeWidth={2} />
          <span>New Import Shipment</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Shipments"
          value={String(totalShipments)}
          description="Active freight imports"
          badge="Shipments"
        />
        <SummaryCard
          label="Goods Purchase Cost"
          value={`$${totalProductCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description="Base FOB value"
          badge="FOB Base"
          badgeColor="text-blue-700 bg-blue-50"
        />
        <SummaryCard
          label="Freight & Customs"
          value={`$${totalAdditionalCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description="Landed additions"
          badge="Logistics"
          badgeColor="text-amber-700 bg-amber-50"
        />
        <SummaryCard
          label="Total Landed Valuation"
          value={`$${totalLandedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description="Capitalized into inventory"
          badge="Valuation"
          badgeColor="text-emerald-700 bg-emerald-50"
        />
      </div>

      {/* Table Section */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by import #, supplier, invoice, or BOL ref..."
              className="h-10 w-full rounded-xl border border-[var(--border)]  pl-9 pr-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-[var(--border)] bg-white pl-3 pr-8 text-xs font-medium text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="REVIEW_REQUIRED">Review Required</option>
                <option value="PROCESSING">Processing</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-left">
                <th className="px-5 py-3 font-semibold text-[var(--muted)]">Import Ref</th>
                <th className="px-4 py-3 font-semibold text-[var(--muted)]">Supplier & Reference</th>
                <th className="px-4 py-3 font-semibold text-[var(--muted)]">Date & Warehouse</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">Items</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">FOB Goods Cost</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">Freight & Duty</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">Total Landed</th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--muted)]">Status</th>
                <th className="w-24 px-4 py-3 text-center font-semibold text-[var(--muted)]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredImports.length > 0 ? (
                filteredImports.map((imp) => (
                  <tr
                    key={imp.id}
                    className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--muted-background)]/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/imports/view/${imp.id}`}
                        className="font-mono font-semibold text-[var(--primary)] hover:underline"
                      >
                        {imp.importNumber}
                      </Link>
                      {imp.documentName && (
                        <p className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-0.5">
                          <FileText size={11} className="text-emerald-700" />
                          <span>Doc attached</span>
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-[var(--foreground)]">{imp.supplierName || "Direct Vendor"}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
                        {imp.supplierInvoiceNumber && <span>Inv: {imp.supplierInvoiceNumber}</span>}
                        {imp.shipmentReference && <span>BOL: {imp.shipmentReference}</span>}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs">
                      <p className="font-medium text-[var(--foreground)]">{imp.importDate}</p>
                      <p className="text-[var(--muted)]">{imp.warehouseName.split("(")[0]}</p>
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-medium text-[var(--foreground)]">
                      {imp.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      <span className="block text-[11px] text-[var(--muted)]">{imp.items.length} SKUs</span>
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-mono font-medium text-slate-700">
                      ${imp.totalProductCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-mono font-semibold text-amber-700">
                      +${imp.totalAdditionalCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-800">
                      ${imp.totalLandedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <ImportStatusBadge status={imp.status} />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/imports/view/${imp.id}`}
                          title="View landed cost details"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:bg-white hover:text-[var(--primary)]"
                        >
                          <Eye size={15} />
                        </Link>
                        {imp.status !== "COMPLETED" && (
                          <Link
                            href={`/imports/edit/${imp.id}`}
                            title="Edit shipment & expenses"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:bg-white hover:text-[var(--primary)] text-xs font-medium"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-[var(--foreground)]">No import records found</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Try modifying your search or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-[var(--border-light)] px-5 py-3 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {filteredImports.length} of {imports.length} shipments</span>
          <span>Inventory Capitalization & Cost Allocation System</span>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  badge,
  badgeColor = "text-[var(--primary)] bg-[var(--primary-light)]",
}: {
  label: string;
  value: string;
  description: string;
  badge: string;
  badgeColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{label}</p>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${badgeColor}`}>{badge}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
    </div>
  );
}

function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const styles: Record<ImportStatus, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REVIEW_REQUIRED: "bg-blue-50 text-blue-700 border-blue-200",
    PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}
