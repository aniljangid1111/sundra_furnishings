import { Suspense } from "react";
import { PurchaseForm } from "@/features/purchases/purchase-form";

export default function NewPurchasePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading purchase order form...</div>}>
      <PurchaseForm mode="create" />
    </Suspense>
  );
}
