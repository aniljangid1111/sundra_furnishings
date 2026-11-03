"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";

import type {
  Purchase,
  PurchaseStatus,
} from "@/features/purchases/purchase.types";
import type { Supplier } from "@/features/suppliers/supplier.types";
import {
  getPurchasesApi,
  deletePurchaseApi,
  type PurchaseKpi,
} from "@/lib/api/purchase.api";
import { getSuppliersApi } from "@/lib/api/supplier.api";
import { downloadPurchasePdf } from "@/lib/pdf-export";
import { CountUp } from "@/components/ui/count-up";
import { PermissionGate } from "@/lib/auth/permissions";

type TimeRange = "TODAY" | "7D" | "30D" | "CUSTOM" | "ALL";

export default function PurchasesPage() {
  const [purchaseList, setPurchaseList] = useState<Purchase[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  const [kpi, setKpi] = useState<PurchaseKpi>({
    totalCount: 0,
    totalValue: 0,
    receivedCount: 0,
    draftCount: 0,
    orderedCount: 0,
    totalBalanceDue: 0,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion
  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch suppliers for filter dropdown
  useEffect(() => {
    getSuppliersApi({ limit: "all" })
      .then((res) => {
        if (res.success && res.data) {
          setSupplierList(res.data);
        }
      })
      .catch((err) => console.error("Failed to load suppliers for PO filter", err));
  }, []);

  const loadPurchases = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const suppId =
          supplierFilter !== "ALL" ? Number(supplierFilter) : undefined;

        const res = await getPurchasesApi({
          page: pageToLoad,
          limit: 10,
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          supplierId: isNaN(suppId as number) ? undefined : suppId,
          timeRange: timeRange !== "ALL" ? timeRange : undefined,
        });

        if (res.success) {
          setPurchaseList(res.data || []);
          if (res.kpi) {
            setKpi(res.kpi as PurchaseKpi);
          }
          if (res.pagination) {
            setPagination({
              currentPage: res.pagination.currentPage,
              totalPages: res.pagination.totalPages,
              totalItems: res.pagination.totalItems,
              hasNextPage: res.pagination.hasNextPage,
              hasPrevPage: res.pagination.hasPrevPage,
            });
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load purchase orders from server.");
      } finally {
        setIsLoading(false);
      }
    },
    [search, statusFilter, supplierFilter, timeRange]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPurchases(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [loadPurchases]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deletePurchaseApi(deleteTarget.id);
      setDeleteTarget(null);
      setOpenMenuId(null);
      loadPurchases(pagination.currentPage);
    } catch (err: any) {
      alert(err.message || "Failed to delete purchase order");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={12} /> Received
          </span>
        );
      case "ORDERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            <Clock size={12} /> Ordered
          </span>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <PackageCheck size={12} /> Partial
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            Draft
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
            <XCircle size={12} /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage procurement, supplier invoices, container imports, and inventory replenishment.
          </p>
        </div>

        <PermissionGate module="purchases" action="create">
          <Link
            href="/purchases/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            <Plus size={18} />
            Create Purchase Order
          </Link>
        </PermissionGate>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Total Purchase Orders
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <ShoppingCart size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            <CountUp value={kpi.totalCount} isLoading={isLoading} />
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Received Orders
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            <CountUp value={kpi.receivedCount} isLoading={isLoading} />
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Ordered / In Transit
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Clock size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            <CountUp value={kpi.orderedCount} isLoading={isLoading} />
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Total Procurement Value
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <FileText size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            <CountUp
              value={kpi.totalValue}
              isLoading={isLoading}
              prefix="$"
              decimals={2}
            />
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xs">
        {/* Filters bar */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              placeholder="Search PO number, supplier, container, or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input !pl-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[150px]">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="form-input appearance-none pr-8 text-sm"
              >
                <option value="ALL">All Suppliers</option>
                {supplierList.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.companyName || s.contactPerson}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            <div className="relative min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input appearance-none pr-8 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="ORDERED">Ordered</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[#fafcfb] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-[var(--muted)]">
                      <Loader2 size={28} className="animate-spin text-[var(--primary)]" />
                      <p className="text-xs font-medium">Loading purchase orders...</p>
                    </div>
                  </td>
                </tr>
              ) : purchaseList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted-background)] text-[var(--muted)]">
                        <ShoppingCart size={22} />
                      </div>
                      <p className="mt-4 text-sm font-medium">No purchase orders found</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Try adjusting your search or create a new order.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                purchaseList.map((p) => {
                  const isMenuOpen = openMenuId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-[var(--muted-background)]/50"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-[var(--foreground)]">
                        {p.purchaseNumber}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-[var(--foreground)]">
                          {p.supplierName}
                        </p>
                        {p.supplierInvoiceNumber && (
                          <p className="font-mono text-xs text-[var(--muted)]">
                            Inv: {p.supplierInvoiceNumber}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-[var(--foreground)]">
                        {p.warehouseName}
                      </td>

                      <td className="px-6 py-4 text-xs text-[var(--muted)]">
                        {new Date(p.purchaseDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-[var(--foreground)]">
                        ${Number(p.grandTotal || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium">
                        {p.balanceDue > 0 ? (
                          <span className="text-amber-600">
                            ${Number(p.balanceDue).toFixed(2)} due
                          </span>
                        ) : (
                          <span className="text-emerald-600">Settled</span>
                        )}
                      </td>

                      <td className="px-6 py-4">{statusBadge(p.status)}</td>

                      <td className="relative px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(isMenuOpen ? null : p.id)
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                          aria-label={`Actions for PO ${p.purchaseNumber}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setOpenMenuId(null)}
                            />

                            <div className="absolute right-6 top-12 z-40 w-44 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg">
                              <Link
                                href={`/purchases/view/${p.id}`}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Eye size={14} /> View Details
                              </Link>

                              <button
                                type="button"
                                onClick={() => {
                                  downloadPurchasePdf(p);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                              >
                                <Download size={14} /> Download PDF
                              </button>

                              <PermissionGate module="purchases" action="edit">
                                <Link
                                  href={`/purchases/edit/${p.id}`}
                                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <Pencil size={14} /> Edit Order
                                </Link>
                              </PermissionGate>

                              <PermissionGate module="purchases" action="delete">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteTarget(p);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </PermissionGate>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-light)] px-6 py-4 text-xs text-[var(--muted)]">
            <span>
              Showing Page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalItems} total orders)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => loadPurchases(pagination.currentPage - 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => loadPurchases(pagination.currentPage + 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Delete Purchase Order
            </h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Are you sure you want to permanently delete purchase order{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {deleteTarget.purchaseNumber}
              </span>{" "}
              from {deleteTarget.supplierName}?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted-background)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
