import { Suspense } from "react";
import { SupplierForm } from "@/features/suppliers/supplier-form";

export default function NewSupplierPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading supplier form...</div>}>
      <SupplierForm mode="create" />
    </Suspense>
  );
}
