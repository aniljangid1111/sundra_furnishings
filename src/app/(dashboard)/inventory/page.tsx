"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  History,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Warehouse as WarehouseIcon,
  X,
} from "lucide-react";
import {
  getInventoryApi,
  adjustStockApi,
  type InventoryKPI,
} from "@/lib/api/inventory.api";
import { getWarehousesApi } from "@/lib/api/warehouse.api";
import type { Warehouse } from "@/features/warehouses/warehouse.types";
import { getCategoriesApi } from "@/lib/api/category.api";
import type { Category } from "@/features/categories/category.types";
import { PermissionGate } from "@/lib/auth/permission-gate";
import { CountUp } from "@/components/ui/count-up";
import type {
  InventoryItem,
  StockStatus,
} from "@/features/inventory/inventory.types";

export default function InventoryPage() {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kpi, setKpi] = useState<InventoryKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StockStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Stock Adjustment modal state
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustmentAction, setAdjustmentAction] = useState<"ADD" | "DEDUCT" | "SET">("ADD");
  const [adjustmentQty, setAdjustmentQty] = useState<string>("");
  const [adjustmentReason, setAdjustmentReason] = useState("Physical cycle count variance");
  const [isSubmittingAdj, setIsSubmittingAdj] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load auxiliary data (warehouses & categories)
  useEffect(() => {
    async function loadAuxData() {
      try {
        const [wRes, cRes] = await Promise.all([
          getWarehousesApi({ limit: 100 }),
          getCategoriesApi({ limit: 100 }),
        ]);
        if (wRes.success && wRes.data) setWarehouses(wRes.data);
        if (cRes.success && cRes.data) setCategories(cRes.data);
      } catch (err) {
        console.error("Failed to load warehouses or categories", err);
      }
    }
    loadAuxData();
  }, []);

  // Fetch live inventory from backend
  const fetchInventory = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await getInventoryApi({
        warehouseId: warehouseFilter !== "ALL" ? warehouseFilter : undefined,
        categoryId: categoryFilter !== "ALL" ? categoryFilter : undefined,
        stockStatus: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setInventoryList(res.data);
        if (res.kpi) setKpi(res.kpi);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setInventoryList([]);
      }
    } catch (err) {
      console.error("Failed to fetch inventory", err);
      setInventoryList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(currentPage);
  }, [warehouseFilter, categoryFilter, statusFilter, currentPage]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchInventory(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const isFiltered =
    search.trim() !== "" ||
    warehouseFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    statusFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setWarehouseFilter("ALL");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  const handleApplyAdjustment = async () => {
    if (!adjustingItem) return;
    const qty = parseInt(adjustmentQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    setIsSubmittingAdj(true);
    try {
      const res = await adjustStockApi({
        productId: adjustingItem.productId,
        warehouseId: adjustingItem.warehouseId,
        action: adjustmentAction,
        quantity: qty,
        reason: adjustmentReason,
      });

      if (res.success) {
        setActionNotice(
          `Stock successfully updated for "${adjustingItem.productName}". Ledger entry recorded.`
        );
        setAdjustingItem(null);
        setAdjustmentQty("");
        fetchInventory(currentPage);
        setTimeout(() => setActionNotice(null), 5000);
      } else {
        alert(res.message || "Failed to adjust stock");
      }
    } catch (err: any) {
      alert(err?.message || "Error submitting stock adjustment");
    } finally {
      setIsSubmittingAdj(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track multi-warehouse stock levels, reserve allocations, and cost valuation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/inventory/stock-ledger"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium hover:bg-[var(--muted-background)]"
          >
            <History size={16} />
            Stock Ledger
          </Link>

          <Link
            href="/inventory/warehouses"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            <WarehouseIcon size={16} />
            Warehouses ({warehouses.length})
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {actionNotice}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Units On-Hand"
          value={kpi?.totalUnits ?? 0}
          isLoading={isLoading}
          icon={Boxes}
          color="text-emerald-700"
          bg="bg-[var(--primary-light)]"
        />
        <SummaryCard
          label="Inventory Valuation (Cost Basis)"
          value={kpi?.totalValuation ?? 0}
          isCurrency
          isLoading={isLoading}
          icon={CircleDollarSign}
          color="text-emerald-700"
          bg="bg-emerald-50"
        />
        <SummaryCard
          label="Low Stock Alerts"
          value={kpi?.lowStockCount ?? 0}
          isLoading={isLoading}
          icon={AlertTriangle}
          color="text-amber-700"
          bg="bg-amber-50"
        />
        <SummaryCard
          label="Out of Stock"
          value={kpi?.outOfStockCount ?? 0}
          isLoading={isLoading}
          icon={AlertTriangle}
          color="text-red-700"
          bg="bg-red-50"
        />
      </div>

      {/* Main Stock Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-xs">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name or SKU..."
              className="form-input !pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-44">
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input appearance-none pr-10"
                aria-label="Filter by warehouse"
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            <div className="relative w-40">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input appearance-none pr-10"
                aria-label="Filter by category"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            <div className="relative w-40">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "ALL" | StockStatus);
                  setCurrentPage(1);
                }}
                className="form-input appearance-none pr-10"
                aria-label="Filter by stock status"
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                title="Reset filters"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-[var(--muted-background)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5 font-medium">Product</th>
                <th className="px-5 py-3.5 font-medium">SKU</th>
                <th className="px-5 py-3.5 font-medium">Warehouse</th>
                <th className="px-5 py-3.5 text-center font-medium">On Hand</th>
                <th className="px-5 py-3.5 text-center font-medium">Reserved</th>
                <th className="px-5 py-3.5 text-center font-medium">Available</th>
                <th className="px-5 py-3.5 text-center font-medium">Reorder</th>
                <th className="px-5 py-3.5 text-right font-medium">Unit Cost</th>
                <th className="px-5 py-3.5 text-right font-medium">Stock Value</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-light)]">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                    Loading inventory records...
                  </td>
                </tr>
              ) : inventoryList.length > 0 ? (
                inventoryList.map((item) => (
                  <tr key={`${item.productId}-${item.warehouseId}`} className="transition hover:bg-[#fafcfb]">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{item.productName}</p>
                        <p className="text-xs text-[var(--muted)]">{item.category}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs">
                      {item.sku}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {item.warehouseName}
                    </td>

                    <td className="px-5 py-4 text-center font-semibold">
                      {item.onHand} <span className="text-[11px] font-normal text-[var(--muted)]">{item.uom}</span>
                    </td>

                    <td className="px-5 py-4 text-center text-xs text-[var(--muted)]">
                      {item.reserved}
                    </td>

                    <td className="px-5 py-4 text-center font-medium text-emerald-800">
                      {item.available}
                    </td>

                    <td className="px-5 py-4 text-center text-xs text-[var(--muted)]">
                      {item.reorderLevel}
                    </td>

                    <td className="px-5 py-4 text-right text-xs">
                      ${Number(item.unitCost || 0).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-[var(--foreground)]">
                      ${Number(item.inventoryValue || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <StockBadge status={item.stockStatus} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <PermissionGate module="inventory" action="edit">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustmentAction("ADD");
                            setAdjustmentQty("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-light)]"
                        >
                          <SlidersHorizontal size={13} />
                          Adjust
                        </button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <Package size={32} className="mx-auto text-[var(--muted)]" />
                      <p className="text-base font-semibold">No stock records found</p>
                      <p className="text-xs text-[var(--muted)]">
                        Try modifying search or filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border-light)] px-5 py-3 sm:flex-row">
          <p className="text-xs text-[var(--muted)]">
            Showing {inventoryList.length} of {pagination.totalItems} inventory lines (Page {pagination.currentPage} of {pagination.totalPages || 1})
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

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-3">
              <h2 className="text-base font-semibold">Stock Adjustment</h2>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded-xl bg-[var(--muted-background)] p-3">
                <p className="font-semibold">{adjustingItem.productName}</p>
                <p className="text-xs text-[var(--muted)]">
                  SKU: {adjustingItem.sku} • Warehouse: {adjustingItem.warehouseName}
                </p>
                <div className="mt-2 flex gap-4 text-xs">
                  <span>Current On-Hand: <strong>{adjustingItem.onHand}</strong></span>
                  <span>Reserved: <strong>{adjustingItem.reserved}</strong></span>
                  <span>Available: <strong>{adjustingItem.available}</strong></span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" htmlFor="adj-action">
                  Adjustment Action
                </label>
                <select
                  id="adj-action"
                  className="form-input"
                  value={adjustmentAction}
                  onChange={(e) => setAdjustmentAction(e.target.value as "ADD" | "DEDUCT" | "SET")}
                >
                  <option value="ADD">Add Stock (+ Units)</option>
                  <option value="DEDUCT">Deduct Stock (- Units)</option>
                  <option value="SET">Set Exact Stock Quantity</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" htmlFor="adj-qty">
                  Quantity
                </label>
                <input
                  id="adj-qty"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 5"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" htmlFor="adj-reason">
                  Adjustment Reason
                </label>
                <select
                  id="adj-reason"
                  className="form-input"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                >
                  <option value="Physical cycle count variance">Physical cycle count variance</option>
                  <option value="Damaged in showroom / floor demo">Damaged in showroom / floor demo</option>
                  <option value="Customer return restock">Customer return restock</option>
                  <option value="Initial stock calibration">Initial stock calibration</option>
                  <option value="Write-off / scrap">Write-off / scrap</option>
                </select>
              </div>

              {adjustmentQty && parseInt(adjustmentQty, 10) > 0 && (
                <div className="rounded-lg border border-[var(--border)] p-3 text-xs bg-[var(--muted-background)]">
                  <span className="text-[var(--muted)]">Calculated Balance: </span>
                  <strong>
                    {adjustmentAction === "ADD"
                      ? adjustingItem.onHand + parseInt(adjustmentQty, 10)
                      : adjustmentAction === "DEDUCT"
                      ? Math.max(0, adjustingItem.onHand - parseInt(adjustmentQty, 10))
                      : parseInt(adjustmentQty, 10)}
                  </strong>{" "}
                  units on hand.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border-light)] pt-4">
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-medium hover:bg-[var(--muted-background)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!adjustmentQty || parseInt(adjustmentQty, 10) <= 0 || isSubmittingAdj}
                onClick={handleApplyAdjustment}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-white! hover:bg-[var(--primary-dark)] disabled:opacity-50"
              >
                {isSubmittingAdj ? "Saving..." : "Apply & Record Ledger"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  isCurrency = false,
  isLoading = false,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  isLoading?: boolean;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}
        >
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">
        <CountUp
          value={value}
          prefix={isCurrency ? "$" : ""}
          decimals={isCurrency ? 2 : 0}
          isLoading={isLoading}
        />
      </p>
    </div>
  );
}

function StockBadge({ status }: { status: StockStatus }) {
  switch (status) {
    case "IN_STOCK":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
          In Stock
        </span>
      );
    case "LOW_STOCK":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
          Low Stock
        </span>
      );
    case "OUT_OF_STOCK":
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-[var(--danger)]">
          Out of Stock
        </span>
      );
  }
}
