"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Trash2,
  XCircle,
} from "lucide-react";

import type {
  Category,
  CategoryStatus,
} from "@/features/categories/category.types";
import {
  deleteCategoryApi,
  getCategoriesApi,
  updateCategoryApi,
  type CategoryKpi,
} from "@/lib/api/category.api";
import { useAuth } from "@/lib/auth/auth-context";
import { PermissionGate } from "@/lib/auth/permissions";
import { CountUp } from "@/components/ui/count-up";

export default function CategoriesPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [kpi, setKpi] = useState<CategoryKpi>({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    totalProductCount: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CategoryStatus>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch categories from real backend API
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCategoriesApi({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      if (response.success && response.data) {
        setCategories(response.data);
        if (response.kpi) {
          setKpi(response.kpi as CategoryKpi);
        }
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  // Refetch when filters change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: "ALL" | CategoryStatus) => {
    setStatusFilter(val);
    setPage(1);
  };

  // Toggle active/inactive status via backend PUT API
  const toggleStatus = async (cat: Category) => {
    const nextStatus: CategoryStatus =
      cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await updateCategoryApi(cat.id, { status: nextStatus });
      if (res.success) {
        showToast(`Category "${cat.name}" is now ${nextStatus.toLowerCase()}.`);
        fetchCategories();
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update category status.");
    } finally {
      setOpenMenuId(null);
    }
  };

  // Delete category via backend DELETE API
  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }
    try {
      await deleteCategoryApi(cat.id);
      showToast(`Category "${cat.name}" deleted successfully.`);
      fetchCategories();
    } catch (err: any) {
      showToast(err?.message || "Failed to delete category.");
    } finally {
      setOpenMenuId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xl animate-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Categories
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage product categories, classification, and catalogue hierarchy.
          </p>
        </div>

        {/* Role-based Permission Gate on Add Category Button */}
        <PermissionGate user={user} module="categories" action="canCreate">
          <Link
            href="/categories/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)] active:scale-95"
          >
            <Plus size={17} />
            <span>Add Category</span>
          </Link>
        </PermissionGate>
      </div>

      {/* Backend Driven KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Categories"
          value={kpi.totalCategories}
          isLoading={isLoading}
          icon={<Tag size={18} />}
        />
        <SummaryCard
          label="Active"
          value={kpi.activeCategories}
          isLoading={isLoading}
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
        />
        <SummaryCard
          label="Inactive"
          value={kpi.inactiveCategories}
          isLoading={isLoading}
          icon={<XCircle size={18} className="text-amber-600" />}
        />
        <SummaryCard
          label="Products Assigned"
          value={kpi.totalProductCount}
          isLoading={isLoading}
          icon={<Tag size={18} />}
        />
      </div>

      {/* Table Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-white shadow-2xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              className="form-input !pl-10"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, code or description..."
            />
          </div>

          <div className="flex items-center justify-end">
            <div className="relative w-44">
              <select
                className="form-input appearance-none pr-10"
                value={statusFilter}
                onChange={(e) =>
                  handleStatusFilterChange(e.target.value as "ALL" | CategoryStatus)
                }
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted-background)]">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Category Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Code
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Description
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Products
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 size={28} className="animate-spin text-[var(--primary)]" />
                      <p className="mt-2 text-xs font-medium text-[var(--muted)]">
                        Loading categories from database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Tag size={32} className="text-[var(--muted)]/50" />
                      <p className="mt-3 text-base font-semibold text-[var(--foreground)]">
                        No categories found
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)] max-w-sm">
                        {search
                          ? `No category matches "${search}". Try searching with a different term.`
                          : "No categories currently exist. Click 'Add Category' above to register your first catalogue category."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-[var(--border-light)] transition hover:bg-[var(--muted-background)]/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                          <Tag size={17} />
                        </div>
                        <Link
                          href={`/categories/view/${category.id}`}
                          className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                        >
                          {category.name}
                        </Link>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-[var(--muted-background)] px-2 py-1 font-mono text-xs font-medium">
                        {category.code}
                      </span>
                    </td>

                    <td className="max-w-[340px] px-5 py-4">
                      <p className="truncate text-sm text-[var(--muted)]">
                        {category.description || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-medium">
                        {category.productCount || 0}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={category.status} />
                    </td>

                    <td className="relative px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === category.id ? null : category.id)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--muted-background)]"
                        aria-label="Actions"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {openMenuId === category.id && (
                        <div className="absolute right-5 top-12 z-30 w-36 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg animate-in fade-in zoom-in-95">
                          <Link
                            href={`/categories/view/${category.id}`}
                            className="block rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-[var(--muted-background)]"
                            onClick={() => setOpenMenuId(null)}
                          >
                            View Details
                          </Link>

                          {/* Role-based Permission Gate on Edit */}
                          <PermissionGate user={user} module="categories" action="canEdit">
                            <Link
                              href={`/categories/edit/${category.id}`}
                              className="block rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-[var(--muted-background)]"
                              onClick={() => setOpenMenuId(null)}
                            >
                              Edit Category
                            </Link>
                          </PermissionGate>

                          {/* Role-based Permission Gate on Status Toggle */}
                          <PermissionGate user={user} module="categories" action="canEdit">
                            <button
                              type="button"
                              onClick={() => toggleStatus(category)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-[var(--muted-background)]"
                            >
                              {category.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            </button>
                          </PermissionGate>

                          {/* Role-based Permission Gate on Delete */}
                          <PermissionGate user={user} module="categories" action="canDelete">
                            <button
                              type="button"
                              onClick={() => handleDelete(category)}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              Delete Category
                            </button>
                          </PermissionGate>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Backend Pagination Footer */}
        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--muted)]">
          <p>
            Showing {categories.length} of {pagination.totalItems} categories • Page{" "}
            {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
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
  isLoading,
  icon,
}: {
  label: string;
  value: number;
  isLoading?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          {label}
        </p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
        <CountUp value={value} isLoading={isLoading} />
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: CategoryStatus }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-[var(--success)]"
          : "bg-gray-100 text-[var(--muted)]"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
