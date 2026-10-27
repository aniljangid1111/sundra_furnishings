import { Suspense } from "react";
import { QuotationForm } from "@/features/quotations/quotation-form";

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading quotation form...</div>}>
      <QuotationForm mode="create" />
    </Suspense>
  );
}
