"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { warehouses as initialWarehouses } from "@/features/warehouses/warehouse.data";
import { initialInventory } from "@/features/inventory/inventory.data";
import type { Warehouse, WarehouseStatus } from "@/features/warehouses/warehouse.types";

export default function WarehousesListPage() {
  const [warehouseList, setWarehouseList] = useState<Warehouse[]>(initialWarehouses);

  const getStockCountForWarehouse = (wId: number) => {
    return initialInventory
      .filter((i) => i.warehouseId === wId)
      .reduce((sum, item) => sum + item.onHand, 0);
  };

  const getStockValueForWarehouse = (wId: number) => {
    return initialInventory
      .filter((i) => i.warehouseId === wId)
      .reduce((sum, item) => sum + item.inventoryValue, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/inventory"
            aria-label="Back to inventory"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Warehouses</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Multi-facility inventory storage, fulfillment locations, and dock points.
            </p>
          </div>
        </div>

        <Link
          href="/inventory/warehouses/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Add Warehouse
        </Link>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {warehouseList.map((w) => {
          const totalUnits = getStockCountForWarehouse(w.id);
          const totalVal = getStockValueForWarehouse(w.id);
          const isActive = w.status === "ACTIVE";

          return (
            <div
              key={w.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs transition hover:border-[var(--primary)]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                      <WarehouseIcon size={20} />
                    </span>
                    <div>
                      <h2 className="font-semibold text-base text-[var(--foreground)]">
                        {w.name}
                      </h2>
                      <span className="font-mono text-xs font-medium text-[var(--muted)]">
                        {w.warehouseCode}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      isActive
                        ? "bg-emerald-50 text-[var(--success)]"
                        : "bg-gray-100 text-[var(--muted)]"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs text-[var(--muted)]">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                  <p>
                    {w.address}, {w.city}, {w.state} {w.postalCode}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[var(--muted-background)] p-3 text-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">On Hand Units</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Valuation</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--primary)]">
                      ${totalVal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {w.notes && (
                  <p className="mt-3 text-xs leading-5 text-[var(--muted)] line-clamp-2">
                    {w.notes}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-[var(--border-light)] pt-4">
                <Link
                  href={`/inventory/warehouses/view/${w.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                >
                  <Eye size={13} /> View
                </Link>
                <Link
                  href={`/inventory/warehouses/edit/${w.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                >
                  <Pencil size={13} /> Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
