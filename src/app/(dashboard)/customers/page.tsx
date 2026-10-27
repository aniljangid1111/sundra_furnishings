"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
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
import { customers as initialCustomers } from "@/features/customers/customer.data";
import type {
  Customer,
  CustomerStatus,
  CustomerType,
} from "@/features/customers/customer.types";

export default function CustomersPage() {
  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CustomerStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | CustomerType>("ALL");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customerList.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.displayName.toLowerCase().includes(query) ||
        customer.firstName.toLowerCase().includes(query) ||
        customer.lastName.toLowerCase().includes(query) ||
        (customer.companyName &&
          customer.companyName.toLowerCase().includes(query)) ||
        customer.customerCode.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || customer.status === statusFilter;

      const matchesType =
        typeFilter === "ALL" || customer.customerType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [customerList, search, statusFilter, typeFilter]);

  // Derived KPI metrics
  const totalCustomers = customerList.length;
  const activeCount = customerList.filter((c) => c.status === "ACTIVE").length;
  const inactiveCount = customerList.filter((c) => c.status === "INACTIVE").length;
  const businessCount = customerList.filter(
    (c) => c.customerType === "BUSINESS",
  ).length;

  const isFiltered =
    search.trim() !== "" || statusFilter !== "ALL" || typeFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  const toggleStatus = (id: number) => {
    setCustomerList((current) =>
      current.map((c) => {
        if (c.id === id) {
          const newStatus: CustomerStatus =
            c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          return { ...c, status: newStatus };
        }
        return c;
      }),
    );
    setOpenMenuId(null);
    setActionNotice(
      "Customer status updated in local UI state. Note: Backend API persistence is pending implementation.",
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
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage customer details, contact information, and payment preferences.
          </p>
        </div>

        <Link
          href="/customers/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Add Customer
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Customers"
          value={totalCustomers}
          icon={Users}
          color="text-emerald-700"
          bg="bg-[var(--primary-light)]"
        />
        <SummaryCard
          label="Active Customers"
          value={activeCount}
          icon={CheckCircle2}
          color="text-emerald-700"
          bg="bg-emerald-50"
        />
        <SummaryCard
          label="Inactive Customers"
          value={inactiveCount}
          icon={CircleOff}
          color="text-amber-700"
          bg="bg-amber-50"
        />
        <SummaryCard
          label="Business Customers"
          value={businessCount}
          icon={Building2}
          color="text-blue-700"
          bg="bg-blue-50"
        />
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, code, email, phone..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "ALL" | CustomerType)
              }
              className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none transition focus:border-[var(--primary)]"
              aria-label="Filter by customer type"
            >
              <option value="ALL">All Types</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="BUSINESS">Business</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | CustomerStatus)
              }
              className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none transition focus:border-[var(--primary)]"
              aria-label="Filter by customer status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

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
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Customer Code</th>
                <th className="px-5 py-3.5 font-medium">Type</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Phone</th>
                <th className="px-5 py-3.5 font-medium">Payment Terms</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredCustomers.map((customer) => {
                const isBusiness = customer.customerType === "BUSINESS";

                return (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-[#fafcfb]"
                  >
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
                            href={`/customers/view/${customer.id}`}
                            className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                          >
                            {customer.displayName}
                          </Link>
                          {isBusiness && customer.companyName && (
                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                              Contact: {customer.firstName} {customer.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-[var(--muted-background)] px-2 py-1 font-mono text-xs font-medium text-[var(--foreground)]">
                        {customer.customerCode}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isBusiness
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isBusiness ? "Business" : "Individual"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {customer.email ? (
                        <a
                          href={`mailto:${customer.email}`}
                          className="hover:text-[var(--primary)] hover:underline"
                        >
                          {customer.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      {customer.phone || "—"}
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-[var(--foreground)]">
                      {customer.paymentTerms}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={customer.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          aria-label={`Actions for ${customer.displayName}`}
                          aria-expanded={openMenuId === customer.id}
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === customer.id ? null : customer.id,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenuId === customer.id && (
                          <div
                            className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <Link
                              href={`/customers/view/${customer.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                            >
                              <Eye size={15} className="text-[var(--muted)]" />
                              View Profile
                            </Link>

                            <Link
                              href={`/customers/edit/${customer.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                            >
                              <Pencil size={15} className="text-[var(--muted)]" />
                              Edit Customer
                            </Link>

                            <button
                              type="button"
                              onClick={() => toggleStatus(customer.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                            >
                              {customer.status === "ACTIVE"
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

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <Users
                        size={32}
                        className="mx-auto text-[var(--muted)]"
                      />
                      <p className="text-base font-semibold text-[var(--foreground)]">
                        No customers found
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        No customer records matched your query. Try clearing
                        filters or create a new customer.
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

        {/* Table Footer */}
        <div className="border-t border-[var(--border-light)] px-5 py-3">
          <p className="text-xs text-[var(--muted)]">
            Showing {filteredCustomers.length} of {customerList.length} customers
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

function StatusBadge({ status }: { status: CustomerStatus }) {
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
