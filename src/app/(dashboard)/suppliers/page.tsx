"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  User,
  Users,
} from "lucide-react";

import type { Supplier, SupplierStatus } from "@/features/suppliers/supplier.types";
import {
  getSuppliersApi,
  updateSupplierApi,
  deleteSupplierApi,
  type SupplierKpi,
} from "@/lib/api/supplier.api";
import { CountUp } from "@/components/ui/count-up";
import { PermissionGate } from "@/lib/auth/permissions";

export default function SuppliersPage() {
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [kpi, setKpi] = useState<SupplierKpi>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0,
    totalOpeningBalance: 0,
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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Deletion
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSuppliers = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await getSuppliersApi({
          page: pageToLoad,
          limit: 10,
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        });

        if (res.success) {
          setSupplierList(res.data || []);
          if (res.kpi) {
            setKpi(res.kpi as SupplierKpi);
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
        setError(err.message || "Failed to load suppliers from server.");
      } finally {
        setIsLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuppliers(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [loadSuppliers]);

  const toggleStatus = async (supplier: Supplier) => {
    const newStatus: SupplierStatus =
      supplier.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setOpenMenuId(null);

    try {
      await updateSupplierApi(supplier.id, { status: newStatus });
      setActionNotice(
        `Supplier status changed to ${newStatus === "ACTIVE" ? "Active" : "Inactive"}.`
      );
      loadSuppliers(pagination.currentPage);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to update supplier status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteSupplierApi(deleteTarget.id);
      setDeleteTarget(null);
      setOpenMenuId(null);
      loadSuppliers(pagination.currentPage);
    } catch (err: any) {
      alert(err.message || "Failed to delete supplier");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  const isFiltered = search.trim() !== "" || statusFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage raw material vendors, mills, hardware creators, and manufacturers.
          </p>
        </div>

        <PermissionGate module="suppliers" action="create">
          <Link
            href="/suppliers/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            <Plus size={18} />
            Add Supplier
          </Link>
        </PermissionGate>
      </div>

      {actionNotice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {actionNotice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Suppliers"
          value={kpi.totalSuppliers}
          isLoading={isLoading}
          icon={Users}
          color="text-emerald-700"
          bg="bg-[var(--primary-light)]"
        />
        <SummaryCard
          label="Active Suppliers"
          value={kpi.activeSuppliers}
          isLoading={isLoading}
          icon={CheckCircle2}
          color="text-emerald-700"
          bg="bg-emerald-50"
        />
        <SummaryCard
          label="Inactive Suppliers"
          value={kpi.inactiveSuppliers}
          isLoading={isLoading}
          icon={CircleOff}
          color="text-amber-700"
          bg="bg-amber-50"
        />
        <SummaryCard
          label="Total Balance Due"
          value={kpi.totalOpeningBalance}
          isLoading={isLoading}
          prefix="$"
          decimals={2}
          icon={Building2}
          color="text-blue-700"
          bg="bg-blue-50"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xs">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              placeholder="Search by company, contact person, code, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input !pl-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input appearance-none pr-8 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[#fafcfb] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                <th className="px-6 py-4">Supplier / Vendor</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Terms</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-[var(--muted)]">
                      <Loader2 size={28} className="animate-spin text-[var(--primary)]" />
                      <p className="text-xs font-medium">Loading suppliers catalogue...</p>
                    </div>
                  </td>
                </tr>
              ) : supplierList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted-background)] text-[var(--muted)]">
                        <Users size={22} />
                      </div>
                      <p className="mt-4 text-sm font-medium">No suppliers found</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Try resetting your search query or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                supplierList.map((s) => {
                  const isActive = s.status === "ACTIVE";
                  const isMenuOpen = openMenuId === s.id;

                  return (
                    <tr
                      key={s.id}
                      className="transition-colors hover:bg-[var(--muted-background)]/50"
                    >
                      {/* Name / Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted-background)] text-[var(--muted)]">
                            {s.supplierType === "BUSINESS" ? (
                              <Building2 size={18} />
                            ) : (
                              <User size={18} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--foreground)]">
                              {s.companyName || s.contactPerson}
                            </p>
                            <p className="font-mono text-xs text-[var(--muted)]">
                              {s.supplierCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {s.contactPerson}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{s.email}</p>
                        <p className="text-xs text-[var(--muted)]">{s.phone}</p>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-xs text-[var(--foreground)]">
                        <p>{s.city}, {s.state}</p>
                        <p className="text-[var(--muted)]">{s.country}</p>
                      </td>

                      {/* Payment Terms */}
                      <td className="px-6 py-4 text-xs font-medium">
                        {s.paymentTerms}
                      </td>

                      {/* Balance */}
                      <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">
                        ${Number(s.openingBalance || 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isActive
                              ? "bg-emerald-50 text-[var(--success)]"
                              : "bg-gray-100 text-[var(--muted)]"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="relative px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(isMenuOpen ? null : s.id)
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                          aria-label={`Actions for ${s.companyName}`}
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
                                href={`/suppliers/view/${s.id}`}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Eye size={14} /> View Details
                              </Link>

                              <PermissionGate module="suppliers" action="edit">
                                <Link
                                  href={`/suppliers/edit/${s.id}`}
                                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <Pencil size={14} /> Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => toggleStatus(s)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                >
                                  {isActive ? (
                                    <>
                                      <CircleOff size={14} /> Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={14} /> Activate
                                    </>
                                  )}
                                </button>
                              </PermissionGate>

                              <PermissionGate module="suppliers" action="delete">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteTarget(s);
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

        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-light)] px-6 py-4 text-xs text-[var(--muted)]">
            <span>
              Showing Page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalItems} total suppliers)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => loadSuppliers(pagination.currentPage - 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => loadSuppliers(pagination.currentPage + 1)}
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
              Delete Supplier
            </h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {deleteTarget.companyName}
              </span>{" "}
              ({deleteTarget.supplierCode})?
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

function SummaryCard({
  label,
  value,
  isLoading,
  prefix = "",
  decimals = 0,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  isLoading?: boolean;
  prefix?: string;
  decimals?: number;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color}`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
        <CountUp
          value={value}
          isLoading={isLoading}
          prefix={prefix}
          decimals={decimals}
        />
      </p>
    </div>
  );
}
