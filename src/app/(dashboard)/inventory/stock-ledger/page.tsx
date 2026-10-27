"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  History,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { initialStockLedger } from "@/features/inventory/inventory.data";
import { warehouses } from "@/features/warehouses/warehouse.data";
import type {
  StockLedgerEntry,
  StockMovementType,
} from "@/features/inventory/inventory.types";

export default function StockLedgerPage() {
  const [ledger] = useState<StockLedgerEntry[]>(initialStockLedger);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | StockMovementType>("ALL");

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();

    return ledger.filter((entry) => {
      const matchesSearch =
        !q ||
        entry.productName.toLowerCase().includes(q) ||
        entry.sku.toLowerCase().includes(q) ||
        entry.referenceDocument.toLowerCase().includes(q) ||
        (entry.notes && entry.notes.toLowerCase().includes(q));

      const matchesWarehouse =
        warehouseFilter === "ALL" ||
        String(entry.warehouseId) === warehouseFilter;

      const matchesType =
        typeFilter === "ALL" || entry.movementType === typeFilter;

      return matchesSearch && matchesWarehouse && matchesType;
    });
  }, [ledger, search, warehouseFilter, typeFilter]);

  const isFiltered =
    search.trim() !== "" || warehouseFilter !== "ALL" || typeFilter !== "ALL";

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
            <h1 className="text-2xl font-semibold tracking-tight">
              Stock Movement Ledger
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Audited transaction ledger detailing every inventory receipt, sales issue, and stock calibration.
            </p>
          </div>
        </div>

        <Link
          href="/inventory"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
        >
          <Boxes size={16} />
          Current Stock Levels
        </Link>
      </div>

      {/* Ledger Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, SKU, product..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none transition focus:border-[var(--primary)]"
              aria-label="Filter by warehouse"
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "ALL" | StockMovementType)
              }
              className="h-10 rounded-xl border border-[var(--border)] bg-white px-3 text-xs outline-none transition focus:border-[var(--primary)]"
              aria-label="Filter by movement type"
            >
              <option value="ALL">All Movements</option>
              <option value="PURCHASE_RECEIPT">Purchase Receipt</option>
              <option value="SALES_INVOICE">Sales Invoice</option>
              <option value="INVENTORY_ADJUSTMENT">Stock Adjustment</option>
              <option value="SALES_RETURN">Sales Return</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setWarehouseFilter("ALL");
                  setTypeFilter("ALL");
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--muted)] hover:bg-[var(--muted-background)]"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-[var(--muted-background)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5 font-medium">Timestamp</th>
                <th className="px-5 py-3.5 font-medium">Product / SKU</th>
                <th className="px-5 py-3.5 font-medium">Warehouse</th>
                <th className="px-5 py-3.5 font-medium">Movement Type</th>
                <th className="px-5 py-3.5 font-medium">Document Ref</th>
                <th className="px-5 py-3.5 text-center font-medium">Change</th>
                <th className="px-5 py-3.5 text-center font-medium">Prev Bal</th>
                <th className="px-5 py-3.5 text-center font-medium">New Bal</th>
                <th className="px-5 py-3.5 font-medium">Notes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredEntries.map((entry) => {
                const isPositive = entry.quantityChange > 0;

                return (
                  <tr key={entry.id} className="transition hover:bg-[#fafcfb]">
                    <td className="px-5 py-4 font-mono text-xs text-[var(--muted)]">
                      {entry.date}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--foreground)]">{entry.productName}</p>
                      <p className="font-mono text-xs text-[var(--muted)]">{entry.sku}</p>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {entry.warehouseName}
                    </td>

                    <td className="px-5 py-4">
                      <MovementTypeBadge type={entry.movementType} />
                    </td>

                    <td className="px-5 py-4 font-mono text-xs font-semibold">
                      {entry.referenceDocument}
                    </td>

                    <td className="px-5 py-4 text-center font-semibold">
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isPositive
                            ? "bg-emerald-50 text-[var(--success)]"
                            : "bg-red-50 text-[var(--danger)]"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft size={13} />
                        ) : (
                          <ArrowUpRight size={13} />
                        )}
                        {isPositive ? `+${entry.quantityChange}` : entry.quantityChange}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center text-xs text-[var(--muted)]">
                      {entry.previousBalance}
                    </td>

                    <td className="px-5 py-4 text-center font-semibold text-[var(--foreground)]">
                      {entry.newBalance}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)] max-w-xs truncate">
                      {entry.notes || "—"}
                    </td>
                  </tr>
                );
              })}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                    No ledger entries match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-light)] px-5 py-3">
          <p className="text-xs text-[var(--muted)]">
            Showing {filteredEntries.length} of {ledger.length} movement records
          </p>
        </div>
      </div>
    </div>
  );
}

function MovementTypeBadge({ type }: { type: StockMovementType }) {
  switch (type) {
    case "PURCHASE_RECEIPT":
      return (
        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
          Purchase Receipt
        </span>
      );
    case "SALES_INVOICE":
      return (
        <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          Sales Invoice
        </span>
      );
    case "INVENTORY_ADJUSTMENT":
      return (
        <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
          Adjustment
        </span>
      );
    case "SALES_RETURN":
      return (
        <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
          Sales Return
        </span>
      );
    default:
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
          {type}
        </span>
      );
  }
}
