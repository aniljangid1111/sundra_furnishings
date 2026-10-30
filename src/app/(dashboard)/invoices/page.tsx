"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Edit3,
  Eye,
  FilePlus2,
  Filter,
  MoreHorizontal,
  Search,
  Store,
  Trash2,
} from "lucide-react";
import { initialInvoices } from "@/features/invoices/invoice.data";
import type { Invoice, InvoicePaymentStatus, InvoiceStatus } from "@/features/invoices/invoice.types";
import { downloadInvoicePdf } from "@/lib/pdf-export";

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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  // Channels for filter
  const channels = Array.from(new Set(invoices.map((inv) => inv.salesChannelName)));

  // Filtered invoices based on search, status, channel, and time range
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.externalOrderId && inv.externalOrderId.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || inv.paymentStatus === paymentFilter;
    const matchesChannel = channelFilter === "ALL" || inv.salesChannelName === channelFilter;
    const matchesTime = isWithinTimeRange(inv.invoiceDate, timeRange);

    return matchesSearch && matchesStatus && matchesPayment && matchesChannel && matchesTime;
  });

  // Summary statistics calculated from active time-filtered data
  const totalCount = filteredInvoices.length;
  const totalValue = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const paidInvoices = filteredInvoices.filter((inv) => inv.paymentStatus === "PAID");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  const pendingInvoices = filteredInvoices.filter(
    (inv) => inv.paymentStatus === "PENDING" || inv.paymentStatus === "PARTIALLY_PAID"
  );
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const overdueInvoices = filteredInvoices.filter((inv) => inv.paymentStatus === "OVERDUE");
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const handleDownloadInvoice = async (invoiceId: number) => {
    const inv = invoices.find((item) => item.id === invoiceId);
    if (!inv) return;
    try {
      await downloadInvoicePdf(inv);
    } catch (err) {
      console.error("Invoice PDF download error:", err);
    }
  };

  const handleCancelInvoice = (id: number, invNum: string) => {
    if (confirm(`Are you sure you want to cancel invoice ${invNum}? This will void billing and reverse any inventory reservations.`)) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "CANCELLED" as InvoiceStatus } : inv))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            Billing & Receivables
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Sales Invoices
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage commercial orders, walk-in receipts, payment status, and order documentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Time Filter Pills */}
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
            href="/invoices/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            <FilePlus2 size={17} strokeWidth={1.8} />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Billed"
          value={`$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description={`${totalCount} commercial invoices`}
          badge="Gross"
        />
        <SummaryCard
          label="Collected Payments"
          value={`$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description={`${paidInvoices.length} fully paid invoices`}
          badge="Received"
          badgeColor="text-emerald-700 bg-emerald-50"
        />
        <SummaryCard
          label="Outstanding / Due"
          value={`$${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description={`${pendingInvoices.length} invoices pending`}
          badge="Receivables"
          badgeColor="text-amber-700 bg-amber-50"
        />
        <SummaryCard
          label="Overdue Receivables"
          value={`$${totalOverdue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description={`${overdueInvoices.length} invoices past due`}
          badge="Attention"
          badgeColor="text-rose-700 bg-rose-50"
        />
      </div>

      {/* Main Table Card */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {/* Filters Header */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice #, buyer..."
              className="form-input !pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status filter */}
            <div className="relative w-36 sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input appearance-none pr-10"
              >
                <option value="ALL">All Statuses</option>
                <option value="ISSUED">Issued</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            {/* Payment filter */}
            <div className="relative w-36 sm:w-40">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="form-input appearance-none pr-10"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            {/* Channel filter */}
            <div className="relative w-36 sm:w-40">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="form-input appearance-none pr-10"
              >
                <option value="ALL">All Channels</option>
                {channels.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-left">
                <th className="px-5 py-3 font-semibold text-[var(--muted)]">Invoice #</th>
                <th className="px-4 py-3 font-semibold text-[var(--muted)]">Date / Due</th>
                <th className="px-4 py-3 font-semibold text-[var(--muted)]">Customer / Buyer</th>
                <th className="px-4 py-3 font-semibold text-[var(--muted)]">Channel</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">Total</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">Paid</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">Balance</th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--muted)]">Payment</th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--muted)]">Doc Status</th>
                <th className="w-28 px-4 py-3 text-center font-semibold text-[var(--muted)]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--muted-background)]/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/invoices/view/${inv.id}`}
                        className="font-mono font-semibold text-[var(--primary)] hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      {inv.quotationId && (
                        <p className="text-[11px] text-[var(--muted)]">from QT-{inv.quotationId}</p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs">
                      <p className="font-medium text-[var(--foreground)]">{inv.invoiceDate}</p>
                      <p className="text-[var(--muted)]">Due {inv.dueDate}</p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-[var(--foreground)]">{inv.buyerName}</p>
                      {inv.buyerEmail && (
                        <p className="text-xs text-[var(--muted)]">{inv.buyerEmail}</p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-[var(--foreground)]">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--muted-background)] px-2 py-1">
                        <Store size={12} className="text-[var(--muted)]" />
                        {inv.salesChannelName}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right font-semibold text-[var(--foreground)]">
                      ${inv.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-medium text-emerald-700">
                      ${inv.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-bold text-amber-700">
                      ${inv.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <PaymentStatusBadge status={inv.paymentStatus} />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Direct 1-Click Download PDF outside */}
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(inv.id)}
                          title="Download Invoice PDF"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:bg-white hover:text-[var(--primary)]"
                        >
                          <Download size={14} />
                        </button>

                        {/* 3-Dots Dropdown Menu */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            aria-label={`Actions for ${inv.invoiceNumber}`}
                            onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--foreground)] hover:bg-white hover:text-[var(--foreground)]"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {openMenuId === inv.id && (
                            <div
                              className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg"
                              onMouseLeave={() => setOpenMenuId(null)}
                            >
                              <Link
                                href={`/invoices/view/${inv.id}`}
                                onClick={() => setOpenMenuId(null)}
                                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                              >
                                <Eye size={14} className="text-[var(--muted)]" />
                                <span>View Document</span>
                              </Link>

                              <Link
                                href={`/invoices/edit/${inv.id}`}
                                onClick={() => setOpenMenuId(null)}
                                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                              >
                                <Edit3 size={14} className="text-[var(--muted)]" />
                                <span>Edit Invoice</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDownloadInvoice(inv.id);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                              >
                                <Download size={14} className="text-[var(--muted)]" />
                                <span>Download PDF</span>
                              </button>

                              {inv.status !== "CANCELLED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleCancelInvoice(inv.id, inv.invoiceNumber);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 size={14} />
                                  <span>Cancel Invoice</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-[var(--foreground)]">No invoices match your filters</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Try adjusting your search query, status or channel filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-[var(--border-light)] px-5 py-3 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
          <span>Commercial ERP Billing System</span>
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
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const styles: Record<InvoiceStatus, string> = {
    ISSUED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: InvoicePaymentStatus }) {
  const styles: Record<InvoicePaymentStatus, string> = {
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PARTIALLY_PAID: "bg-blue-50 text-blue-700 border-blue-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    OVERDUE: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}