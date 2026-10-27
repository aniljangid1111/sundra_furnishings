"use client";

import Link from "next/link";
import {
  ChevronDown,
  Download,
  Eye,
  FilePlus2,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { useState } from "react";

const invoices = [
  {
    id: "INV-1024",
    customer: "Urban Living Co.",
    date: "Oct 18, 2026",
    dueDate: "Nov 17, 2026",
    amount: "$4,280.00",
    status: "Paid",
  },
  {
    id: "INV-1023",
    customer: "Modern Home LLC",
    date: "Oct 17, 2026",
    dueDate: "Nov 16, 2026",
    amount: "$2,850.00",
    status: "Pending",
  },
  {
    id: "INV-1022",
    customer: "Oak & Stone",
    date: "Oct 16, 2026",
    dueDate: "Nov 15, 2026",
    amount: "$6,420.00",
    status: "Paid",
  },
  {
    id: "INV-1021",
    customer: "Casa Interiors",
    date: "Oct 15, 2026",
    dueDate: "Nov 14, 2026",
    amount: "$1,980.00",
    status: "Overdue",
  },
  {
    id: "INV-1020",
    customer: "Haven & Co.",
    date: "Oct 14, 2026",
    dueDate: "Nov 13, 2026",
    amount: "$3,740.00",
    status: "Paid",
  },
  {
    id: "INV-1019",
    customer: "The Home Studio",
    date: "Oct 13, 2026",
    dueDate: "Nov 12, 2026",
    amount: "$5,125.00",
    status: "Pending",
  },
  {
    id: "INV-1018",
    customer: "North Oak Interiors",
    date: "Oct 12, 2026",
    dueDate: "Nov 11, 2026",
    amount: "$2,460.00",
    status: "Paid",
  },
];

const statusOptions = ["All", "Paid", "Pending", "Overdue"];

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === "All" || invoice.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            Operations
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Invoices
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage customer invoices and payment status.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
        >
          <FilePlus2 size={17} strokeWidth={1.8} />
          Create invoice
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total invoices"
          value="128"
          description="This month"
        />

        <SummaryCard
          label="Paid"
          value="$38,420"
          description="78 invoices"
        />

        <SummaryCard
          label="Pending"
          value="$8,540"
          description="18 invoices"
        />

        <SummaryCard
          label="Overdue"
          value="$4,140"
          description="7 invoices"
        />
      </div>

      {/* Invoice table */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice or customer..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--muted-background)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 appearance-none rounded-xl border border-[var(--border)] bg-white pl-3 pr-9 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-left">
                <th className="px-5 py-3 font-medium text-[var(--muted)]">
                  Invoice
                </th>

                <th className="px-5 py-3 font-medium text-[var(--muted)]">
                  Customer
                </th>

                <th className="px-5 py-3 font-medium text-[var(--muted)]">
                  Invoice date
                </th>

                <th className="px-5 py-3 font-medium text-[var(--muted)]">
                  Due date
                </th>

                <th className="px-5 py-3 text-right font-medium text-[var(--muted)]">
                  Amount
                </th>

                <th className="px-5 py-3 text-right font-medium text-[var(--muted)]">
                  Status
                </th>

                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      No invoices found
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Try changing your search or status filter.
                    </p>
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

          <span>
            Page 1 of 1
          </span>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function InvoiceRow({
  invoice,
}: {
  invoice: (typeof invoices)[number];
}) {
  return (
    <tr className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--muted-background)]/60">
      <td className="px-5 py-4">
        <Link
          href={`/invoices/${invoice.id}`}
          className="font-medium text-[var(--primary)] hover:underline"
        >
          {invoice.id}
        </Link>
      </td>

      <td className="px-5 py-4 font-medium text-[var(--foreground)]">
        {invoice.customer}
      </td>

      <td className="px-5 py-4 text-[var(--muted)]">
        {invoice.date}
      </td>

      <td className="px-5 py-4 text-[var(--muted)]">
        {invoice.dueDate}
      </td>

      <td className="px-5 py-4 text-right font-medium text-[var(--foreground)]">
        {invoice.amount}
      </td>

      <td className="px-5 py-4 text-right">
        <StatusBadge status={invoice.status} />
      </td>

      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="View invoice"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-white hover:text-[var(--primary)]"
          >
            <Eye size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            title="Download invoice"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-white hover:text-[var(--primary)]"
          >
            <Download size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            title="More actions"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-white hover:text-[var(--foreground)]"
          >
            <MoreHorizontal size={17} strokeWidth={1.8} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles = {
    Paid: "bg-[var(--primary-light)] text-[var(--primary)]",
    Pending: "bg-amber-50 text-amber-700",
    Overdue: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles]
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}