"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, PackageOpen } from "lucide-react";
import { getDashboardInsightsApi, type DashboardInsights } from "@/lib/api/insight.api";
import { getInvoicesApi } from "@/lib/api/invoice.api";
import { getInventoryAlertsApi } from "@/lib/api/inventory.api";
import type { Invoice } from "@/features/invoices/invoice.types";
import type { InventoryItem } from "@/features/inventory/inventory.types";
import { CountUp } from "@/components/ui/count-up";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"TODAY" | "7D" | "30D" | "CUSTOM" | "ALL">("30D");
  const [customStartDate, setCustomStartDate] = useState("2026-10-01");
  const [customEndDate, setCustomEndDate] = useState("2026-10-28");
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [insRes, invRes, alertRes] = await Promise.all([
          getDashboardInsightsApi({
            timeRange: timeRange !== "ALL" ? timeRange : undefined,
            startDate: timeRange === "CUSTOM" && customStartDate ? customStartDate : undefined,
            endDate: timeRange === "CUSTOM" && customEndDate ? customEndDate : undefined,
          }),
          getInvoicesApi({ limit: 5 }),
          getInventoryAlertsApi(),
        ]);

        if (insRes.success && insRes.data) setInsights(insRes.data);
        if (invRes.success && invRes.data) setRecentInvoices(invRes.data);
        if (alertRes.success && alertRes.data) setLowStock(alertRes.data);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [timeRange, customStartDate, customEndDate]);

  const totalSales = insights?.kpi.totalSales ?? 0;
  const grossProfit = insights?.kpi.grossProfit ?? 0;
  const outstanding = insights?.kpi.outstandingAmount ?? 0;
  const inventoryValue = insights?.kpi.inventoryValue ?? 0;

  const salesData = (insights?.monthlyTrends || []).map((t) => ({
    month: t.month,
    sales: t.revenue,
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[28px]">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Live business overview, sales velocity, and inventory alerts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter
            value={timeRange}
            onChange={setTimeRange}
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={setCustomStartDate}
            onEndDateChange={setCustomEndDate}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL SALES */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Total Sales</p>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              <CountUp value={totalSales} prefix="$" decimals={2} isLoading={isLoading} />
            </p>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">Invoiced volume</p>
        </div>

        {/* GROSS PROFIT */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Gross Profit</p>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              <CountUp value={grossProfit} prefix="$" decimals={2} isLoading={isLoading} />
            </p>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {insights?.kpi.profitMarginPercent ?? 0}% gross margin
          </p>
        </div>

        {/* OUTSTANDING */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Outstanding</p>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              <CountUp value={outstanding} prefix="$" decimals={2} isLoading={isLoading} />
            </p>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">Pending receivables</p>
        </div>

        {/* INVENTORY VALUE */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Inventory Value</p>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              <CountUp value={inventoryValue} prefix="$" decimals={2} isLoading={isLoading} />
            </p>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {insights?.kpi.totalProducts ?? 0} active catalog items
          </p>
        </div>
      </div>

      {/* Revenue chart */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">
              Revenue overview
            </h2>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Monthly billed revenue comparison
            </p>
          </div>
        </div>

        <div className="mt-6 h-[260px] w-full">
          {!isMounted ? (
            <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Loading chart...</div>
          ) : salesData.length === 0 || salesData.every((d) => d.sales === 0) ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted)]">
              <FileText size={28} className="text-[var(--muted)]/50" />
              <p className="mt-2 font-medium text-[var(--foreground)]">No revenue data available yet</p>
              <p className="mt-1 text-xs text-[var(--muted)]/80">
                Revenue trends will plot automatically once sales invoices are issued.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#176b52" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#176b52" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1ef" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#718078", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#718078", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#176b52" strokeWidth={2} fillOpacity={1} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Bottom two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent invoices */}
        <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">
                Recent invoices
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Latest billing activity and payment statuses
              </p>
            </div>

            <Link
              href="/invoices"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-xs">
                <tr>
                  <th className="px-5 py-3 font-medium text-[var(--muted)]">
                    Invoice
                  </th>

                  <th className="px-5 py-3 font-medium text-[var(--muted)]">
                    Customer
                  </th>

                  <th className="px-5 py-3 font-medium text-[var(--muted)]">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-[var(--muted)]">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-[var(--muted)]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={28} className="text-[var(--muted)]/60" />
                        <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                          No recent invoices available
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          Invoices created in the system will display here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--muted-background)]"
                    >
                      <td className="px-5 py-4 font-medium text-[var(--foreground)]">
                        <Link href={`/invoices/view/${inv.id}`} className="hover:underline text-[var(--primary)]">
                          {inv.invoiceNumber}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-[var(--muted)]">
                        {inv.buyerName}
                      </td>

                      <td className="px-5 py-4 text-[var(--muted)]">
                        {inv.invoiceDate}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-[var(--foreground)]">
                        ${Number(inv.grandTotal || 0).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--primary-light)] text-[var(--primary)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {inv.paymentStatus || inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Low stock alerts */}
        <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">
                Low stock
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Products that need attention
              </p>
            </div>

            <Link
              href="/inventory"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-[var(--border-light)]">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <PackageOpen size={30} className="text-[var(--muted)]/60" />
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                  No low stock alerts
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  All items are above safety reorder thresholds.
                </p>
              </div>
            ) : (
              lowStock.slice(0, 5).map((item) => (
                <div
                  key={`${item.productId}-${item.warehouseId}`}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{item.sku} • {item.warehouseName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-amber-600">
                      {item.onHand} / {item.reorderLevel}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
