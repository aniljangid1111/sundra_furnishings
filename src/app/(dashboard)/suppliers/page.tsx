"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleOff,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  User,
  Users,
} from "lucide-react";
import { suppliers as initialSuppliers } from "@/features/suppliers/supplier.data";
import type {
  Supplier,
  SupplierStatus,
} from "@/features/suppliers/supplier.types";

export default function SuppliersPage() {
  const [supplierList, setSupplierList] =
    useState<Supplier[]>(initialSuppliers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SupplierStatus>(
    "ALL",
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return supplierList.filter((s) => {
      const matchesSearch =
        !query ||
        s.companyName.toLowerCase().includes(query) ||
        s.contactPerson.toLowerCase().includes(query) ||
        s.supplierCode.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [supplierList, search, statusFilter]);

  const totalSuppliers = supplierList.length;
  const activeCount = supplierList.filter((s) => s.status === "ACTIVE").length;
  const inactiveCount = supplierList.filter(
    (s) => s.status === "INACTIVE",
  ).length;
  const businessCount = supplierList.filter(
    (s) => s.supplierType === "BUSINESS",
  ).length;

  const isFiltered = search.trim() !== "" || statusFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  const toggleStatus = (id: number) => {
    setSupplierList((current) =>
      current.map((s) => {
        if (s.id === id) {
          const newStatus: SupplierStatus =
            s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          return { ...s, status: newStatus };
        }
        return s;
      }),
    );
    setOpenMenuId(null);
    setActionNotice(
      "Supplier status updated in local UI state. Note: Backend API persistence is pending implementation.",
    );
    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

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

        <Link
          href="/suppliers/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Add Supplier
        </Link>
      </div>

      {actionNotice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {actionNotice}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Suppliers"
          value={totalSuppliers}
          icon={Users}
          color="text-emerald-700"
          bg="bg-[var(--primary-light)]"
        />
        <SummaryCard
          label="Active Suppliers"
          value={activeCount}
          icon={CheckCircle2}
          color="text-emerald-700"
          bg="bg-emerald-50"
        />
        <SummaryCard
          label="Inactive Suppliers"
          value={inactiveCount}
          icon={CircleOff}
          color="text-amber-700"
          bg="bg-amber-50"
        />
        <SummaryCard
          label="Business Vendors"
          value={businessCount}
          icon={Building2}
          color="text-blue-700"
          bg="bg-blue-50"
        />
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white">
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor, code, contact..."
              className="form-input !pl-10"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-40">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | SupplierStatus)
                }
                className="form-input appearance-none pr-10"
                aria-label="Filter by supplier status"
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

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                title="Reset filters"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[var(--muted-background)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5 font-medium">Supplier</th>
                <th className="px-5 py-3.5 font-medium">Code</th>
                <th className="px-5 py-3.5 font-medium">Contact Person</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Phone</th>
                <th className="px-5 py-3.5 font-medium">Payment Terms</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredSuppliers.map((s) => {
                const isBusiness = s.supplierType === "BUSINESS";
                const displayName = s.companyName || s.contactPerson;

                return (
                  <tr key={s.id} className="transition hover:bg-[#fafcfb]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isBusiness
                              ? "bg-blue-50 text-blue-700"
                              : "bg-[var(--primary-light)] text-[var(--primary)]"
                          }`}
                        >
                          {isBusiness ? (
                            <Building2 size={18} />
                          ) : (
                            <User size={18} />
                          )}
                        </span>
                        <div>
                          <Link
                            href={`/suppliers/view/${s.id}`}
                            className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                          >
                            {displayName}
                          </Link>
                          {isBusiness && (
                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                              {s.city}, {s.state}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-[var(--muted-background)] px-2 py-1 font-mono text-xs font-medium text-[var(--foreground)]">
                        {s.supplierCode}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-[var(--foreground)]">
                      {s.contactPerson}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {s.email ? (
                        <a
                          href={`mailto:${s.email}`}
                          className="hover:text-[var(--primary)] hover:underline"
                        >
                          {s.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      {s.phone || "—"}
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-[var(--foreground)]">
                      {s.paymentTerms}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={s.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          aria-label={`Actions for ${displayName}`}
                          aria-expanded={openMenuId === s.id}
                          onClick={() =>
                            setOpenMenuId(openMenuId === s.id ? null : s.id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenuId === s.id && (
                          <div
                            className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <Link
                              href={`/suppliers/view/${s.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                            >
                              <Eye size={15} className="text-[var(--muted)]" />
                              View Profile
                            </Link>

                            <Link
                              href={`/suppliers/edit/${s.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                            >
                              <Pencil size={15} className="text-[var(--muted)]" />
                              Edit Supplier
                            </Link>

                            <button
                              type="button"
                              onClick={() => toggleStatus(s.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                            >
                              {s.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <Users
                        size={32}
                        className="mx-auto text-[var(--muted)]"
                      />
                      <p className="text-base font-semibold text-[var(--foreground)]">
                        No suppliers found
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Try modifying search or filter parameters.
                      </p>
                      {isFiltered && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                          >
                            <RotateCcw size={13} />
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-light)] px-5 py-3">
          <p className="text-xs text-[var(--muted)]">
            Showing {filteredSuppliers.length} of {supplierList.length} suppliers
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}
        >
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: SupplierStatus }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-[var(--success)]"
          : "bg-gray-100 text-[var(--muted)]"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
