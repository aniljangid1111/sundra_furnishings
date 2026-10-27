import { Suspense } from "react";
import { WarehouseForm } from "@/features/warehouses/warehouse-form";

export default function NewWarehousePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading warehouse form...</div>}>
      <WarehouseForm mode="create" />
    </Suspense>
  );
}
