"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Warehouse as WarehouseIcon,
  XCircle,
} from "lucide-react";

import type { Warehouse } from "@/features/warehouses/warehouse.types";
import {
  getWarehousesApi,
  deleteWarehouseApi,
  type WarehouseKpi,
} from "@/lib/api/warehouse.api";
import { CountUp } from "@/components/ui/count-up";
import { PermissionGate } from "@/lib/auth/permissions";

export default function WarehousesListPage() {
  const [warehouseList, setWarehouseList] = useState<Warehouse[]>([]);
  const [kpi, setKpi] = useState<WarehouseKpi>({
    totalWarehouses: 0,
    activeWarehouses: 0,
    inactiveWarehouses: 0,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadWarehouses = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await getWarehousesApi({
          page: pageToLoad,
          limit: 9,
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        });

        if (res.success) {
          setWarehouseList(res.data || []);
          if (res.kpi) {
            setKpi(res.kpi as WarehouseKpi);
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
        setError(err.message || "Failed to load warehouses");
      } finally {
        setIsLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWarehouses(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [loadWarehouses]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteWarehouseApi(deleteTarget.id);
      setDeleteTarget(null);
      loadWarehouses(pagination.currentPage);
    } catch (err: any) {
      alert(err.message || "Failed to delete warehouse");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/inventory"
            aria-label="Back to inventory"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Warehouses</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Multi-facility inventory storage, fulfillment locations, and dock points.
            </p>
          </div>
        </div>

        <PermissionGate module="warehouses" action="create">
          <Link
            href="/inventory/warehouses/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            <Plus size={18} />
            Add Warehouse
          </Link>
        </PermissionGate>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Total Facilities
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <WarehouseIcon size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            <CountUp value={kpi.totalWarehouses} isLoading={isLoading} />
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Active Hubs
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            <CountUp value={kpi.activeWarehouses} isLoading={isLoading} />
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Inactive
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
              <XCircle size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            <CountUp value={kpi.inactiveWarehouses} isLoading={isLoading} />
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search warehouse code, name, city, state..."
            className="form-input !pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input text-xs"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{error}</p>
        </div>
      )}

      {/* Warehouse Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-16 text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-[var(--primary)]" />
            <p className="mt-3 text-xs text-[var(--muted)]">Loading warehouses...</p>
          </div>
        ) : warehouseList.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
            <WarehouseIcon size={36} className="mx-auto text-[var(--muted)]/50" />
            <p className="mt-3 text-base font-semibold text-[var(--foreground)]">
              No warehouses found
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Try adjusting your search or add a new facility location.
            </p>
          </div>
        ) : (
          warehouseList.map((w) => {
            const isActive = w.status === "ACTIVE";

            return (
              <div
                key={w.id}
                className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs transition hover:border-[var(--primary)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                        <WarehouseIcon size={20} />
                      </span>
                      <div>
                        <h2 className="font-semibold text-base text-[var(--foreground)]">
                          {w.name}
                        </h2>
                        <span className="font-mono text-xs font-medium text-[var(--muted)]">
                          {w.warehouseCode}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        isActive
                          ? "bg-emerald-50 text-[var(--success)]"
                          : "bg-gray-100 text-[var(--muted)]"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-start gap-2 text-xs text-[var(--muted)]">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                    <p>
                      {w.address}, {w.city}, {w.state} {w.postalCode}
                    </p>
                  </div>

                  {w.notes && (
                    <p className="mt-3 text-xs leading-5 text-[var(--muted)] line-clamp-2">
                      {w.notes}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-[var(--border-light)] pt-4">
                  <Link
                    href={`/inventory/warehouses/view/${w.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                  >
                    <Eye size={13} /> View
                  </Link>

                  <PermissionGate module="warehouses" action="edit">
                    <Link
                      href={`/inventory/warehouses/edit/${w.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                    >
                      <Pencil size={13} /> Edit
                    </Link>
                  </PermissionGate>

                  <PermissionGate module="warehouses" action="delete">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(w)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      title="Delete Warehouse"
                    >
                      <Trash2 size={13} />
                    </button>
                  </PermissionGate>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border-light)] pt-4 text-xs text-[var(--muted)]">
          <span>
            Showing Page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalItems} total facilities)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => loadWarehouses(pagination.currentPage - 1)}
              className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => loadWarehouses(pagination.currentPage + 1)}
              className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

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
              Delete Warehouse
            </h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {deleteTarget.name}
              </span>{" "}
              ({deleteTarget.warehouseCode})?
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
