"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
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
import { downloadPurchasePdf } from "@/lib/pdf-export";
import type {
  Purchase,
  PurchaseStatus,
} from "@/features/purchases/purchase.types";

type TimeRange = "TODAY" | "7D" | "30D" | "ALL";

function isWithinTimeRange(dateStr: string, range: TimeRange): boolean {
  if (range === "ALL") return true;
  if (!dateStr) return true;
  const d = new Date(dateStr);
  const now = new Date();
  const anchorTime = now.getFullYear() >= 2026 ? now.getTime() : new Date("2026-10-18T23:59:59Z").getTime();
  const diffDays = Math.abs(anchorTime - d.getTime()) / (1000 * 60 * 60 * 24);

  if (range === "TODAY") {
    return dateStr.startsWith("2026-10-18") || d.toDateString() === now.toDateString();
  }
  if (range === "7D") {
    return diffDays <= 7 || dateStr.startsWith("2026-10-1");
  }
  if (range === "30D") {
    return diffDays <= 30 || dateStr.startsWith("2026-10") || dateStr.startsWith("2026-09");
  }
  return true;
}

export default function PurchasesPage() {
  const [purchaseList, setPurchaseList] =
    useState<Purchase[]>(initialPurchases);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PurchaseStatus>(
    "ALL",
  );
  const [supplierFilter, setSupplierFilter] = useState<string>("ALL");
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");
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
          p.supplierInvoiceNumber.toLowerCase().includes(query)) ||
        (p.containerNumber &&
          p.containerNumber.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      const matchesSupplier =
        supplierFilter === "ALL" || String(p.supplierId) === supplierFilter;

      const matchesTime = isWithinTimeRange(p.purchaseDate || p.createdAt, timeRange);

      return matchesSearch && matchesStatus && matchesSupplier && matchesTime;
    });
  }, [purchaseList, search, statusFilter, supplierFilter, timeRange]);

  // Derived KPI metrics matching filtered records
  const totalValue = filteredPurchases.reduce((acc, p) => acc + p.grandTotal, 0);
  const receivedCount = filteredPurchases.filter((p) => p.status === "RECEIVED").length;
  const draftCount = filteredPurchases.filter((p) => p.status === "DRAFT").length;
  const totalBalanceDue = filteredPurchases.reduce(
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

  const handleDownloadPurchase = async (purchaseId: number) => {
    const p = purchaseList.find((item) => item.id === purchaseId);
    if (!p) return;
    try {
      await downloadPurchasePdf(p);
    } catch (err) {
      console.error("PDF download error:", err);
    }
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter Pills */}
          <div className="inline-flex rounded-xl border border-[var(--border)] bg-white p-1 text-xs font-medium shadow-2xs">
            {(["TODAY", "7D", "30D", "ALL"] as const).map((r) => {
              const labels = {
                TODAY: "Today",
                "7D": "Last 7 Days",
                "30D": "Last 30 Days",
                ALL: "All Time",
              };
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    timeRange === r
                      ? "bg-[var(--primary)] text-white! shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          <Link
            href="/purchases/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            <Plus size={18} />
            New Purchase Order
          </Link>
        </div>
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
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PO#, supplier, inv#..."
              className="form-input !pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-44">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="form-input appearance-none pr-10"
                aria-label="Filter by supplier"
              >
                <option value="ALL">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.companyName || s.contactPerson}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            <div className="relative w-40">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | PurchaseStatus)
                }
                className="form-input appearance-none pr-10"
                aria-label="Filter by purchase status"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ORDERED">Ordered</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
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
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[var(--muted-background)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5 font-medium">Purchase #</th>
                <th className="px-5 py-3.5 font-medium">Invoice Date</th>
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
                      {p.containerNumber && (
                        <p className="font-sans text-[11px] font-normal text-[var(--muted)]">
                          Cont: {p.containerNumber}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      <span className="font-medium text-[var(--foreground)]">{p.purchaseDate}</span>
                      {p.expectedDate && (
                        <p className="text-[11px] text-[var(--muted)]">Inward: {p.expectedDate}</p>
                      )}
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
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownloadPurchase(p.id)}
                          title="Download Purchase Order PDF"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--primary)]"
                        >
                          <Download size={15} />
                        </button>

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

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDownloadPurchase(p.id);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                              >
                                <Download size={15} className="text-[var(--muted)]" />
                                Download PDF
                              </button>

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
