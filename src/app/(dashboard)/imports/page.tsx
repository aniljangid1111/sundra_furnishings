"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  getImportsApi,
  deleteImportApi,
  type ImportKPI,
} from "@/lib/api/import.api";
import type { ImportShipment, ImportStatus } from "@/features/imports/import.types";
import { CountUp } from "@/components/ui/count-up";
import { PermissionGate } from "@/lib/auth/permission-gate";

export default function ImportsListingPage() {
  const [imports, setImports] = useState<ImportShipment[]>([]);
  const [kpi, setKpi] = useState<ImportKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchImports = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await getImportsApi({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setImports(res.data);
        if (res.kpi) setKpi(res.kpi);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setImports([]);
      }
    } catch (err) {
      console.error("Failed to load imports:", err);
      setImports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImports(currentPage);
  }, [statusFilter, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchImports(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number, importNum: string) => {
    if (confirm(`Are you sure you want to delete shipment ${importNum}?`)) {
      try {
        const res = await deleteImportApi(id);
        if (res.success) {
          fetchImports(currentPage);
        } else {
          alert(res.message || "Failed to delete import shipment");
        }
      } catch (err: any) {
        alert(err?.message || "Error deleting shipment");
      }
    }
  };

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

        <PermissionGate module="imports" action="create">
          <Link
            href="/imports/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            <Plus size={17} strokeWidth={2} />
            <span>New Import Shipment</span>
          </Link>
        </PermissionGate>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Shipments"
          value={kpi?.totalImports ?? 0}
          isLoading={isLoading}
          description="Active freight imports"
          badge="Shipments"
        />
        <SummaryCard
          label="Completed Imports"
          value={kpi?.completedCount ?? 0}
          isLoading={isLoading}
          description="Landed & capitalized"
          badge="Completed"
          badgeColor="text-emerald-700 bg-emerald-50"
        />
        <SummaryCard
          label="In-Transit / Processing"
          value={kpi?.processingCount ?? 0}
          isLoading={isLoading}
          description="En-route or at port"
          badge="Processing"
          badgeColor="text-amber-700 bg-amber-50"
        />
        <SummaryCard
          label="Total Landed Valuation"
          value={kpi?.totalLandedCost ?? 0}
          isCurrency
          isLoading={isLoading}
          description="Capitalized landed costs"
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
              className="h-10 w-full rounded-xl border border-[var(--border)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                    Loading import shipments...
                  </td>
                </tr>
              ) : imports.length > 0 ? (
                imports.map((imp) => (
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
                      <p className="text-[var(--muted)]">{(imp.warehouseName || "Main Warehouse").split("(")[0]}</p>
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-medium text-[var(--foreground)]">
                      {(imp.items || []).reduce((sum, item) => sum + item.quantity, 0)} units
                      <span className="block text-[11px] text-[var(--muted)]">{(imp.items || []).length} SKUs</span>
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-mono font-medium text-slate-700">
                      ${Number(imp.totalProductCost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-mono font-semibold text-amber-700">
                      +${Number(imp.totalAdditionalCosts || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-800">
                      ${Number(imp.totalLandedCost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                          <PermissionGate module="imports" action="edit">
                            <Link
                              href={`/imports/edit/${imp.id}`}
                              title="Edit shipment & expenses"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:bg-white hover:text-[var(--primary)] text-xs font-medium"
                            >
                              Edit
                            </Link>
                          </PermissionGate>
                        )}
                        <PermissionGate module="imports" action="delete">
                          <button
                            type="button"
                            onClick={() => handleDelete(imp.id, imp.importNumber)}
                            title="Delete shipment"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-rose-500 hover:bg-white hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </PermissionGate>
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

        {/* Dynamic Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border-light)] px-5 py-3 sm:flex-row">
          <p className="text-xs text-[var(--muted)]">
            Showing {imports.length} of {pagination.totalItems} shipments (Page {pagination.currentPage} of {pagination.totalPages || 1})
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)] disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs font-medium px-1 text-[var(--muted)]">
              {pagination.currentPage} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)] disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  isCurrency = false,
  isLoading = false,
  description,
  badge,
  badgeColor = "text-[var(--primary)] bg-[var(--primary-light)]",
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  isLoading?: boolean;
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
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
        <CountUp
          value={value}
          prefix={isCurrency ? "$" : ""}
          decimals={isCurrency ? 2 : 0}
          isLoading={isLoading}
        />
      </p>
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
