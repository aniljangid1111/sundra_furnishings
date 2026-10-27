import { Suspense } from "react";
import { InvoiceForm } from "@/features/invoices/invoice-form";

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading invoice form...</div>}>
      <InvoiceForm mode="create" />
    </Suspense>
  );
}