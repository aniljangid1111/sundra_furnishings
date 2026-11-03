"use client";

import { useEffect, useState } from "react";
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
  Edit3,
  Eye,
  FilePlus2,
  MoreHorizontal,
  Search,
  Store,
  Trash2,
} from "lucide-react";
import {
  getInvoicesApi,
  deleteInvoiceApi,
  type InvoiceKPI,
} from "@/lib/api/invoice.api";
import { getSalesChannelsApi } from "@/lib/api/salesChannel.api";
import type { SalesChannel } from "@/features/sales-channels/sales-channel.types";
import type {
  Invoice,
  InvoicePaymentStatus,
  InvoiceStatus,
} from "@/features/invoices/invoice.types";
import { downloadInvoicePdf } from "@/lib/pdf-export";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { CountUp } from "@/components/ui/count-up";
import { PermissionGate } from "@/lib/auth/permission-gate";

type TimeRange = "TODAY" | "7D" | "30D" | "CUSTOM" | "ALL";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [kpi, setKpi] = useState<InvoiceKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Load sales channels
  useEffect(() => {
    async function loadChannels() {
      try {
        const res = await getSalesChannelsApi({ limit: 100 });
        if (res.success && res.data) setChannels(res.data);
      } catch (err) {
        console.error("Failed to load sales channels", err);
      }
    }
    loadChannels();
  }, []);

  // Fetch invoices from backend
  const fetchInvoices = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await getInvoicesApi({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        paymentStatus: paymentFilter !== "ALL" ? paymentFilter : undefined,
        salesChannel: channelFilter !== "ALL" ? channelFilter : undefined,
        search: search.trim() || undefined,
        timeRange: timeRange !== "ALL" ? timeRange : undefined,
        startDate: timeRange === "CUSTOM" && customStartDate ? customStartDate : undefined,
        endDate: timeRange === "CUSTOM" && customEndDate ? customEndDate : undefined,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setInvoices(res.data);
        if (res.kpi) setKpi(res.kpi);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Failed to fetch invoices", err);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(currentPage);
  }, [statusFilter, paymentFilter, channelFilter, timeRange, customStartDate, customEndDate, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchInvoices(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      await downloadInvoicePdf(invoice);
    } catch (err) {
      console.error("Invoice PDF download error:", err);
    }
  };

  const handleCancelInvoice = async (id: number, invNum: string) => {
    if (confirm(`Are you sure you want to delete/cancel invoice ${invNum}? This will void the invoice record.`)) {
      try {
        const res = await deleteInvoiceApi(id);
        if (res.success) {
          fetchInvoices(currentPage);
        } else {
          alert(res.message || "Failed to cancel invoice");
        }
      } catch (err: any) {
        alert(err?.message || "Error cancelling invoice");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <DateRangeFilter
            value={timeRange}
            onChange={(val) => {
              setTimeRange(val as TimeRange);
              setCurrentPage(1);
            }}
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={setCustomStartDate}
            onEndDateChange={setCustomEndDate}
          />

          <PermissionGate module="invoices" action="create">
            <Link
              href="/invoices/new"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 text-xs font-semibold text-white! shadow-xs transition hover:bg-[var(--primary-dark)] whitespace-nowrap"
            >
              <FilePlus2 size={16} strokeWidth={1.8} />
              <span>Create Invoice</span>
            </Link>
          </PermissionGate>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Billed"
          value={kpi?.totalValue ?? kpi?.totalRevenue ?? 0}
          isCurrency
          isLoading={isLoading}
          description={`${kpi?.totalCount ?? kpi?.totalInvoices ?? 0} commercial invoices`}
          badge="Gross"
        />
        <SummaryCard
          label="Collected Payments"
          value={kpi?.totalPaid ?? kpi?.paidAmount ?? 0}
          isCurrency
          isLoading={isLoading}
          description="Total settled receipts"
          badge="Received"
          badgeColor="text-emerald-700 bg-emerald-50"
        />
        <SummaryCard
          label="Outstanding / Due"
          value={kpi?.totalPending ?? kpi?.pendingAmount ?? 0}
          isCurrency
          isLoading={isLoading}
          description="Invoices pending payment"
          badge="Receivables"
          badgeColor="text-amber-700 bg-amber-50"
        />
        <SummaryCard
          label="Overdue Receivables"
          value={kpi?.totalOverdue ?? kpi?.overdueAmount ?? 0}
          isCurrency
          isLoading={isLoading}
          description="Invoices past due date"
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setChannelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input appearance-none pr-10"
              >
                <option value="ALL">All Channels</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.name}>
                    {ch.name}
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
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((inv) => (
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
                      ${Number(inv.grandTotal || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-medium text-emerald-700">
                      ${Number(inv.amountPaid || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-right text-xs font-bold text-amber-700">
                      ${Number(inv.balanceDue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                          onClick={() => handleDownloadInvoice(inv)}
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

                              <PermissionGate module="invoices" action="edit">
                                <Link
                                  href={`/invoices/edit/${inv.id}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                >
                                  <Edit3 size={14} className="text-[var(--muted)]" />
                                  <span>Edit Invoice</span>
                                </Link>
                              </PermissionGate>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDownloadInvoice(inv);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                              >
                                <Download size={14} className="text-[var(--muted)]" />
                                <span>Download PDF</span>
                              </button>

                              <PermissionGate module="invoices" action="delete">
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
                                    <span>Cancel / Delete</span>
                                  </button>
                                )}
                              </PermissionGate>
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

        {/* Dynamic Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border-light)] px-5 py-3 sm:flex-row">
          <p className="text-xs text-[var(--muted)]">
            Showing {invoices.length} of {pagination.totalItems} invoices (Page {pagination.currentPage} of {pagination.totalPages || 1})
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
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}
        >
          {badge}
        </span>
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

function PaymentStatusBadge({ status }: { status: InvoicePaymentStatus }) {
  switch (status) {
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-[var(--success)]">
          <CheckCircle2 size={12} />
          Paid
        </span>
      );
    case "PARTIALLY_PAID":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          <Clock size={12} />
          Partial
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          <Clock size={12} />
          Pending
        </span>
      );
    case "OVERDUE":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
          <AlertCircle size={12} />
          Overdue
        </span>
      );
  }
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case "ISSUED":
      return (
        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
          Issued
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
          Draft
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
          Cancelled
        </span>
      );
  }
}
