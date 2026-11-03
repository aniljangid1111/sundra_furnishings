"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
} from "lucide-react";
import { getStockLedgerApi } from "@/lib/api/inventory.api";
import { getWarehousesApi } from "@/lib/api/warehouse.api";
import type { Warehouse } from "@/features/warehouses/warehouse.types";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import type {
  StockLedgerEntry,
  StockMovementType,
} from "@/features/inventory/inventory.types";

type TimeRange = "TODAY" | "7D" | "30D" | "CUSTOM" | "ALL";

export default function StockLedgerPage() {
  const [ledger, setLedger] = useState<StockLedgerEntry[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | StockMovementType>("ALL");
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 15,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Load warehouses
  useEffect(() => {
    async function loadWarehouses() {
      try {
        const res = await getWarehousesApi({ limit: 100 });
        if (res.success && res.data) setWarehouses(res.data);
      } catch (err) {
        console.error("Failed to load warehouses", err);
      }
    }
    loadWarehouses();
  }, []);

  // Fetch live ledger
  const fetchLedger = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await getStockLedgerApi({
        warehouseId: warehouseFilter !== "ALL" ? warehouseFilter : undefined,
        movementType: typeFilter !== "ALL" ? typeFilter : undefined,
        search: search.trim() || undefined,
        timeRange: timeRange !== "ALL" ? timeRange : undefined,
        startDate: timeRange === "CUSTOM" && customStartDate ? customStartDate : undefined,
        endDate: timeRange === "CUSTOM" && customEndDate ? customEndDate : undefined,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setLedger(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setLedger([]);
      }
    } catch (err) {
      console.error("Failed to fetch ledger", err);
      setLedger([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger(currentPage);
  }, [warehouseFilter, typeFilter, timeRange, customStartDate, customEndDate, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchLedger(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const isFiltered =
    search.trim() !== "" ||
    warehouseFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    timeRange !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setWarehouseFilter("ALL");
    setTypeFilter("ALL");
    setTimeRange("ALL");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <DateRangeFilter
            value={timeRange}
            onChange={(val) => {
              setTimeRange(val as TimeRange);
              setCurrentPage(1);
            }}
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={setCustomStartDate}
            onEndDateChange={setCustomEndDate}
          />

          <Link
            href="/inventory"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 text-xs font-semibold text-white! transition hover:bg-[var(--primary-dark)] whitespace-nowrap"
          >
            <Boxes size={16} />
            <span>Current Stock Levels</span>
          </Link>
        </div>
      </div>

      {/* Ledger Table Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-xs">
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
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setTypeFilter(e.target.value as "ALL" | StockMovementType);
                setCurrentPage(1);
              }}
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
                onClick={handleResetFilters}
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
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                    Loading stock movements...
                  </td>
                </tr>
              ) : ledger.length > 0 ? (
                ledger.map((entry) => {
                  const isPositive = Number(entry.quantityChange) > 0;

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
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                    No ledger entries match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border-light)] px-5 py-3 sm:flex-row">
          <p className="text-xs text-[var(--muted)]">
            Showing {ledger.length} of {pagination.totalItems} entries (Page {pagination.currentPage} of {pagination.totalPages || 1})
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)] disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs font-medium px-1 text-[var(--muted)]">
              {pagination.currentPage} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)] disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
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
