import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Building2,
  Calendar,
  FileText,
  MapPin,
  Pencil,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { warehouses } from "@/features/warehouses/warehouse.data";
import { initialInventory } from "@/features/inventory/inventory.data";

interface ViewWarehousePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewWarehousePage({
  params,
}: ViewWarehousePageProps) {
  const { id } = await params;
  const wh = warehouses.find((item) => item.id === Number(id));

  if (!wh) {
    notFound();
  }

  const warehouseStock = initialInventory.filter((i) => i.warehouseId === wh.id);
  const totalUnits = warehouseStock.reduce((acc, i) => acc + i.onHand, 0);
  const totalValuation = warehouseStock.reduce((acc, i) => acc + i.inventoryValue, 0);
  const isActive = wh.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/inventory/warehouses"
            aria-label="Back to warehouses"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">{wh.name}</h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isActive ? "bg-emerald-50 text-[var(--success)]" : "bg-gray-100 text-[var(--muted)]"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Warehouse Code: <span className="font-mono font-medium text-[var(--foreground)]">{wh.warehouseCode}</span>
            </p>
          </div>
        </div>

        <Link
          href={`/inventory/warehouses/edit/${wh.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)]"
        >
          <Pencil size={16} />
          Edit Warehouse
        </Link>
      </div>

      {/* Facility overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Stored Inventory Units</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{totalUnits}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Facility Stock Valuation</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
            ${totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Facility Location</p>
          <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
            {wh.city}, {wh.state}
          </p>
        </div>
      </div>

      {/* Stock Stored Here */}
      <section className="rounded-2xl border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border-light)] px-5 py-4">
          <h2 className="font-semibold text-sm">Products Stored at {wh.name}</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Active bin quantities and reserve statuses in this facility.
          </p>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-[var(--border-light)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="pb-3 font-medium">Product / Category</th>
                <th className="pb-3 font-medium">SKU</th>
                <th className="pb-3 text-center font-medium">On Hand</th>
                <th className="pb-3 text-center font-medium">Reserved</th>
                <th className="pb-3 text-center font-medium">Available</th>
                <th className="pb-3 text-right font-medium">Inventory Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {warehouseStock.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-[var(--muted)]">{item.category}</p>
                  </td>
                  <td className="py-3 font-mono text-xs text-[var(--muted)]">{item.sku}</td>
                  <td className="py-3 text-center font-medium">{item.onHand} {item.uom}</td>
                  <td className="py-3 text-center text-xs text-[var(--muted)]">{item.reserved}</td>
                  <td className="py-3 text-center font-medium text-emerald-800">{item.available}</td>
                  <td className="py-3 text-right font-semibold">${item.inventoryValue.toLocaleString()}</td>
                </tr>
              ))}
              {warehouseStock.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[var(--muted)]">
                    No active stock stored at this location.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div>
        <Link
          href="/inventory/warehouses"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Back to Warehouses
        </Link>
      </div>
    </div>
  );
}
