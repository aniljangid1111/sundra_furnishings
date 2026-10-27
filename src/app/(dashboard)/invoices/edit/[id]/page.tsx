import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { InvoiceForm } from "@/features/invoices/invoice-form";
import { initialInvoices } from "@/features/invoices/invoice.data";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;

  const invoice = initialInvoices.find(
    (item) => item.id === Number(id) || item.invoiceNumber.toLowerCase() === id.toLowerCase()
  );

  if (!invoice) {
    notFound();
  }

  // If the invoice is already issued/locked, show clear policy guard
  if (invoice.status !== "DRAFT") {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-8">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Lock size={28} />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
            Invoice {invoice.invoiceNumber} is Locked
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            This invoice has already been issued ({invoice.status}) and cannot be edited directly. To make corrections, issue an adjustment or credit note to maintain audit compliance.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/invoices"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)]"
            >
              <ArrowLeft size={16} />
              Back to Invoices
            </Link>
            <Link
              href={`/invoices/view/${invoice.id}`}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
            >
              View Document
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <InvoiceForm mode="edit" invoice={invoice} />;
}
