import { Suspense } from "react";
import { ImportForm } from "@/features/imports/import-form";

export default function NewImportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading import shipment form...</div>}>
      <ImportForm mode="create" />
    </Suspense>
  );
}
