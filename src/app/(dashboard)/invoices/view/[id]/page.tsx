"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { initialInvoices } from "@/features/invoices/invoice.data";
import { InvoiceDocument } from "@/features/invoices/invoice-document";

interface ViewInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function ViewInvoicePage({ params }: ViewInvoicePageProps) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading invoice document...</div>}>
      <ViewInvoiceContent params={params} />
    </Suspense>
  );
}

function ViewInvoiceContent({ params }: ViewInvoicePageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (searchParams.get("print") === "true") {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const invoice = initialInvoices.find(
    (item) => item.id === Number(id) || item.invoiceNumber.toLowerCase() === id.toLowerCase()
  );

  if (!invoice) {
    notFound();
  }

  const handleDownload = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ISSUED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DRAFT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARTIALLY_PAID":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "OVERDUE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar - Hidden during print */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Link href="/invoices" className="hover:text-[var(--primary)] flex items-center gap-1">
              <ArrowLeft size={13} />
              Invoices
            </Link>
            <span>/</span>
            <span className="font-mono font-medium text-[var(--foreground)]">{invoice.invoiceNumber}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {invoice.invoiceNumber}
            </h1>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
              {invoice.status}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPaymentBadge(invoice.paymentStatus)}`}>
              Payment: {invoice.paymentStatus.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {invoice.status === "DRAFT" && (
            <Link
              href={`/invoices/edit/${invoice.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted-background)]"
            >
              <Edit3 size={15} />
              Edit Draft
            </Link>
          )}

          {/* AUTHORIZED LOCATION 2: Invoice View Page Download Action */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isPrinting}
            title="Download / Print official PDF invoice"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--primary-dark)] active:scale-95"
          >
            <Download size={16} />
            <span>Download Invoice PDF</span>
          </button>
        </div>
      </div>

      {/* Meta context cards - Hidden during print */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Buyer / Customer</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)] truncate">{invoice.buyerName}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{invoice.salesChannelName}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Invoice Date / Due Date</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{invoice.invoiceDate}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Due: {invoice.dueDate}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Grand Total</p>
          <p className="mt-1 text-lg font-bold text-[var(--foreground)]">${invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-emerald-600 font-medium">Paid: ${invoice.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Balance Outstanding</p>
          <p className="mt-1 text-lg font-bold text-amber-600">${invoice.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Origin: {invoice.warehouseName.split("(")[0]}</p>
        </div>
      </div>

      {/* Realistic Printable Invoice Document Container */}
      <div className="rounded-2xl border border-[var(--border)] bg-slate-100/60 p-4 sm:p-8 shadow-sm print:m-0 print:border-none print:bg-white print:p-0 print:shadow-none">
        <div className="rounded-xl bg-white shadow-md border border-slate-200/80 overflow-hidden print:border-none print:shadow-none">
          <InvoiceDocument invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
