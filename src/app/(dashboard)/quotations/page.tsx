"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { quotations as initialQuotations } from "@/features/quotations/quotation.data";
import type {
  Quotation,
  QuotationStatus,
} from "@/features/quotations/quotation.types";

export default function QuotationsPage() {
  const [quotationList, setQuotationList] =
    useState<Quotation[]>(initialQuotations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | QuotationStatus>(
    "ALL",
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredQuotes = useMemo(() => {
    const q = search.trim().toLowerCase();

    return quotationList.filter((quote) => {
      const matchesSearch =
        !q ||
        quote.quotationNumber.toLowerCase().includes(q) ||
        quote.buyerName.toLowerCase().includes(q) ||
        (quote.buyerEmail && quote.buyerEmail.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotationList, search, statusFilter]);

  // Derived KPIs
  const totalCount = quotationList.length;
  const draftCount = quotationList.filter((q) => q.status === "DRAFT").length;
  const acceptedCount = quotationList.filter(
    (q) => q.status === "ACCEPTED",
  ).length;
  const convertedCount = quotationList.filter(
    (q) => q.status === "CONVERTED",
  ).length;

  const isFiltered = search.trim() !== "" || statusFilter !== "ALL";

  const handleConvertToInvoice = (id: number) => {
    setQuotationList((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const generatedInvoiceNumber = `INV-${Math.floor(
            Math.random() * 900 + 1025,
          )}`;
          return {
            ...q,
            status: "CONVERTED" as QuotationStatus,
            convertedInvoiceId: Date.now(),
            convertedInvoiceNumber: generatedInvoiceNumber,
          };
        }
        return q;
      }),
    );
    setOpenMenuId(null);
    setActionNotice(
      "Quotation successfully converted to Invoice! Navigation ready in Sales Invoices.",
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quotations</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create, manage, and convert commercial sales proposals and customer estimates.
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          New Quotation
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
          label="Total Proposals"
          value={totalCount}
          icon={FileText}
          color="text-emerald-700"
          bg="bg-[var(--primary-light)]"
        />
        <SummaryCard
          label="Draft Quotations"
          value={draftCount}
          icon={Clock}
          color="text-blue-700"
          bg="bg-blue-50"
        />
        <SummaryCard
          label="Accepted by Buyer"
          value={acceptedCount}
          icon={CheckCircle2}
          color="text-emerald-700"
          bg="bg-emerald-50"
        />
        <SummaryCard
          label="Converted to Invoices"
          value={convertedCount}
          icon={FileCheck}
          color="text-purple-700"
          bg="bg-purple-50"
        />
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotation #, buyer..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | QuotationStatus)
              }
              className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none transition focus:border-[var(--primary)]"
              aria-label="Filter by quotation status"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="CONVERTED">Converted</option>
              <option value="EXPIRED">Expired</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--muted)] hover:bg-[var(--muted-background)]"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[var(--muted-background)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5 font-medium">Quotation #</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Buyer</th>
                <th className="px-5 py-3.5 font-medium">Valid Until</th>
                <th className="px-5 py-3.5 text-right font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredQuotes.map((q) => {
                return (
                  <tr key={q.id} className="transition hover:bg-[#fafcfb]">
                    <td className="px-5 py-4 font-mono text-xs font-semibold">
                      <Link
                        href={`/quotations/view/${q.id}`}
                        className="hover:text-[var(--primary)] hover:underline"
                      >
                        {q.quotationNumber}
                      </Link>
                      {q.convertedInvoiceNumber && (
                        <p className="font-sans text-[11px] font-normal text-purple-700">
                          → {q.convertedInvoiceNumber}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {q.quotationDate}
                    </td>

                    <td className="px-5 py-4 font-medium text-[var(--foreground)]">
                      {q.buyerName}
                      {q.salesChannelName && (
                        <p className="text-xs font-normal text-[var(--muted)]">
                          {q.salesChannelName}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {q.validUntil}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-[var(--foreground)]">
                      ${q.grandTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <QuotationStatusBadge status={q.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          aria-label={`Actions for ${q.quotationNumber}`}
                          aria-expanded={openMenuId === q.id}
                          onClick={() =>
                            setOpenMenuId(openMenuId === q.id ? null : q.id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenuId === q.id && (
                          <div
                            className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <Link
                              href={`/quotations/view/${q.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                            >
                              <Eye size={15} className="text-[var(--muted)]" />
                              View Proposal
                            </Link>

                            {q.status !== "CONVERTED" && (
                              <Link
                                href={`/quotations/edit/${q.id}`}
                                onClick={() => setOpenMenuId(null)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                              >
                                <Pencil size={15} className="text-[var(--muted)]" />
                                Edit Proposal
                              </Link>
                            )}

                            {q.status !== "CONVERTED" && (
                              <button
                                type="button"
                                onClick={() => handleConvertToInvoice(q.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--primary)] hover:bg-[var(--primary-light)] font-medium"
                              >
                                <FileCheck size={15} />
                                Convert to Invoice
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                    No quotations found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-light)] px-5 py-3">
          <p className="text-xs text-[var(--muted)]">
            Showing {filteredQuotes.length} of {quotationList.length} quotations
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

function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  switch (status) {
    case "CONVERTED":
      return (
        <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
          Converted
        </span>
      );
    case "ACCEPTED":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
          Accepted
        </span>
      );
    case "SENT":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          Sent
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          Draft
        </span>
      );
    case "EXPIRED":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
          Expired
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-[var(--danger)]">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          {status}
        </span>
      );
  }
}
