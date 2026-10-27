"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { purchases as initialPurchases } from "@/features/purchases/purchase.data";
import { suppliers } from "@/features/suppliers/supplier.data";
import type {
  Purchase,
  PurchaseStatus,
} from "@/features/purchases/purchase.types";

export default function PurchasesPage() {
  const [purchaseList, setPurchaseList] =
    useState<Purchase[]>(initialPurchases);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PurchaseStatus>(
    "ALL",
  );
  const [supplierFilter, setSupplierFilter] = useState<string>("ALL");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredPurchases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return purchaseList.filter((p) => {
      const matchesSearch =
        !query ||
        p.purchaseNumber.toLowerCase().includes(query) ||
        p.supplierName.toLowerCase().includes(query) ||
        (p.supplierInvoiceNumber &&
          p.supplierInvoiceNumber.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      const matchesSupplier =
        supplierFilter === "ALL" || String(p.supplierId) === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [purchaseList, search, statusFilter, supplierFilter]);

  // Derived KPI metrics
  const totalValue = purchaseList.reduce((acc, p) => acc + p.grandTotal, 0);
  const receivedCount = purchaseList.filter((p) => p.status === "RECEIVED").length;
  const draftCount = purchaseList.filter((p) => p.status === "DRAFT").length;
  const totalBalanceDue = purchaseList.reduce(
    (acc, p) => acc + p.balanceDue,
    0,
  );

  const isFiltered =
    search.trim() !== "" || statusFilter !== "ALL" || supplierFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSupplierFilter("ALL");
  };

  const handleReceiveItems = (id: number) => {
    setPurchaseList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedItems = p.items.map((item) => ({
            ...item,
            receivedQuantity: item.quantity,
          }));
          return { ...p, status: "RECEIVED" as PurchaseStatus, items: updatedItems };
        }
        return p;
      }),
    );
    setOpenMenuId(null);
    setActionNotice(
      "Purchase received! Inventory has been committed to destination warehouse in local session state.",
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleCancelOrder = (id: number) => {
    setPurchaseList((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "CANCELLED" as PurchaseStatus } : p,
      ),
    );
    setOpenMenuId(null);
    setActionNotice("Purchase order marked as CANCELLED.");
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchases</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage purchase orders, supplier shipments, receiving, and procurement costs.
          </p>
        </div>

        <Link
          href="/purchases/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          New Purchase Order
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
          label="Total Purchase Value"
          value={`$${totalValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={ShoppingCart}
          color="text-emerald-700"
          bg="bg-[var(--primary-light)]"
        />
        <SummaryCard
          label="Received Purchases"
          value={receivedCount}
          icon={PackageCheck}
          color="text-emerald-700"
          bg="bg-emerald-50"
        />
        <SummaryCard
          label="Draft Orders"
          value={draftCount}
          icon={Clock}
          color="text-blue-700"
          bg="bg-blue-50"
        />
        <SummaryCard
          label="Outstanding Balance"
          value={`$${totalBalanceDue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={FileText}
          color="text-amber-700"
          bg="bg-amber-50"
        />
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white">
        {/* Filters Bar */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PO#, supplier, inv#..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none transition focus:border-[var(--primary)]"
              aria-label="Filter by supplier"
            >
              <option value="ALL">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.companyName || s.contactPerson}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | PurchaseStatus)
              }
              className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none transition focus:border-[var(--primary)]"
              aria-label="Filter by purchase status"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ORDERED">Ordered</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
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
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[var(--muted-background)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5 font-medium">Purchase #</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Supplier</th>
                <th className="px-5 py-3.5 font-medium">Warehouse</th>
                <th className="px-5 py-3.5 text-right font-medium">Total</th>
                <th className="px-5 py-3.5 text-right font-medium">Paid</th>
                <th className="px-5 py-3.5 text-right font-medium">Balance</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredPurchases.map((p) => {
                return (
                  <tr key={p.id} className="transition hover:bg-[#fafcfb]">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-[var(--foreground)]">
                      <Link
                        href={`/purchases/view/${p.id}`}
                        className="hover:text-[var(--primary)] hover:underline"
                      >
                        {p.purchaseNumber}
                      </Link>
                      {p.supplierInvoiceNumber && (
                        <p className="font-sans text-[11px] font-normal text-[var(--muted)]">
                          Inv: {p.supplierInvoiceNumber}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {p.purchaseDate}
                    </td>

                    <td className="px-5 py-4 font-medium text-[var(--foreground)]">
                      {p.supplierName}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {p.warehouseName}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-[var(--foreground)]">
                      ${p.grandTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-5 py-4 text-right text-xs text-[var(--muted)]">
                      ${p.amountPaid.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-5 py-4 text-right text-xs font-medium">
                      <span
                        className={
                          p.balanceDue > 0
                            ? "text-amber-700"
                            : "text-[var(--muted)]"
                        }
                      >
                        ${p.balanceDue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <PurchaseStatusBadge status={p.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          aria-label={`Actions for ${p.purchaseNumber}`}
                          aria-expanded={openMenuId === p.id}
                          onClick={() =>
                            setOpenMenuId(openMenuId === p.id ? null : p.id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenuId === p.id && (
                          <div
                            className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <Link
                              href={`/purchases/view/${p.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                            >
                              <Eye size={15} className="text-[var(--muted)]" />
                              View Order
                            </Link>

                            {p.status !== "RECEIVED" && p.status !== "CANCELLED" && (
                              <Link
                                href={`/purchases/edit/${p.id}`}
                                onClick={() => setOpenMenuId(null)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                              >
                                <Pencil size={15} className="text-[var(--muted)]" />
                                Edit Order
                              </Link>
                            )}

                            {p.status !== "RECEIVED" && p.status !== "CANCELLED" && (
                              <button
                                type="button"
                                onClick={() => handleReceiveItems(p.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-emerald-800 hover:bg-emerald-50"
                              >
                                <PackageCheck size={15} />
                                Receive Stock
                              </button>
                            )}

                            {p.status !== "CANCELLED" && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(p.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-red-50"
                              >
                                <XCircle size={15} />
                                Cancel Order
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <ShoppingCart
                        size={32}
                        className="mx-auto text-[var(--muted)]"
                      />
                      <p className="text-base font-semibold text-[var(--foreground)]">
                        No purchase orders found
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Try modifying search or filter criteria.
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
            Showing {filteredPurchases.length} of {purchaseList.length} purchases
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
  value: string | number;
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

function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  switch (status) {
    case "RECEIVED":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
          Received
        </span>
      );
    case "ORDERED":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          Ordered
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          Draft
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-[var(--danger)]">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          {status}
        </span>
      );
  }
}
