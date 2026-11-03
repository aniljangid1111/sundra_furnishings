"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  ShoppingCart,
  Store,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { CountUp } from "@/components/ui/count-up";
import { getInvoicesApi } from "@/lib/api/invoice.api";
import { getPurchasesApi } from "@/lib/api/purchase.api";
import { getInventoryApi } from "@/lib/api/inventory.api";
import { getDashboardInsightsApi, type DashboardInsights } from "@/lib/api/insight.api";
import type { Invoice } from "@/features/invoices/invoice.types";
import type { Purchase } from "@/features/purchases/purchase.types";
import type { InventoryItem } from "@/features/inventory/inventory.types";

type ReportTab = "sales" | "purchases" | "profit-loss" | "inventory" | "outstanding" | "channels";
type TimeRange = "TODAY" | "7D" | "30D" | "CUSTOM" | "ALL";

export default function ReportsDashboardPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [customStartDate, setCustomStartDate] = useState("2026-10-01");
  const [customEndDate, setCustomEndDate] = useState("2026-10-28");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const queryParams = {
          timeRange: timeRange !== "ALL" ? timeRange : undefined,
          startDate: timeRange === "CUSTOM" && customStartDate ? customStartDate : undefined,
          endDate: timeRange === "CUSTOM" && customEndDate ? customEndDate : undefined,
        };

        const [invRes, poRes, invStockRes, insightRes] = await Promise.allSettled([
          getInvoicesApi({ ...queryParams, limit: 100 }),
          getPurchasesApi({ ...queryParams, limit: 100 }),
          getInventoryApi({ limit: 100 }),
          getDashboardInsightsApi(queryParams),
        ]);

        if (isCancelled) return;

        if (invRes.status === "fulfilled" && invRes.value.success) {
          setInvoices(invRes.value.data || []);
        }
        if (poRes.status === "fulfilled" && poRes.value.success) {
          setPurchases(poRes.value.data || []);
        }
        if (invStockRes.status === "fulfilled" && invStockRes.value.success) {
          setInventory(invStockRes.value.data || []);
        }
        if (insightRes.status === "fulfilled" && insightRes.value.success) {
          setInsights(insightRes.value.data || null);
        }
      } catch (err) {
        console.error("Failed to load reports data", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [timeRange, customStartDate, customEndDate]);

  // Derived metrics
  const totalSalesRevenue = useMemo(
    () => invoices.reduce((sum, item) => sum + (Number(item.grandTotal) || 0), 0),
    [invoices]
  );

  const totalReceivables = useMemo(
    () => invoices.reduce((sum, item) => sum + (Number(item.balanceDue) || 0), 0),
    [invoices]
  );

  const totalPayables = useMemo(
    () => purchases.reduce((sum, item) => sum + (Number(item.balanceDue) || 0), 0),
    [purchases]
  );

  const grossProfit = insights?.kpi?.grossProfit ?? Math.max(0, totalSalesRevenue * 0.45);
  const profitMargin = insights?.kpi?.profitMarginPercent ?? (totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0);

  // Channels performance from insights
  const channelPerformance = useMemo(() => {
    return insights?.channelBreakdown || [];
  }, [insights]);

  // Real CSV Export Function
  const handleExportCSV = () => {
    const filename = `Sundara_${activeTab.toUpperCase()}_Report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    switch (activeTab) {
      case "sales":
        headers = ["Invoice Number", "Date", "Customer", "Sales Channel", "Total ($)", "Paid ($)", "Balance Due ($)", "Status"];
        rows = invoices.map((s) => [
          s.invoiceNumber,
          s.invoiceDate,
          s.buyerName,
          s.salesChannelName || "Direct",
          s.grandTotal,
          s.amountPaid,
          s.balanceDue,
          s.status,
        ]);
        break;
      case "purchases":
        headers = ["PO Number", "Order Date", "Supplier", "Warehouse", "Total ($)", "Amount Paid ($)", "Balance Due ($)", "Status"];
        rows = purchases.map((p) => [
          p.purchaseNumber,
          p.purchaseDate,
          p.supplierName,
          p.warehouseName,
          p.grandTotal,
          p.amountPaid,
          p.balanceDue,
          p.status,
        ]);
        break;
      case "profit-loss":
        headers = ["Metric Line Item", "Amount ($)"];
        rows = [
          ["Gross Commercial Invoicing", totalSalesRevenue],
          ["Cost of Goods Sold (COGS)", totalSalesRevenue - grossProfit],
          ["Gross Profit", grossProfit],
          ["Gross Profit Margin (%)", `${profitMargin.toFixed(1)}%`],
        ];
        break;
      case "inventory":
        headers = ["Product Name", "SKU", "Category", "On-Hand Units", "Unit Cost ($)", "Stock Valuation ($)"];
        rows = inventory.map((i) => [
          i.productName,
          i.sku,
          i.category || "Standard",
          i.onHand,
          i.unitCost,
          i.inventoryValue,
        ]);
        break;
      case "outstanding":
        headers = ["Type", "Party", "Reference", "Due Date", "Balance Due ($)", "Total Amount ($)"];
        const receivablesRows = invoices
          .filter((s) => (s.balanceDue || 0) > 0)
          .map((s) => ["Customer Receivable", s.buyerName, s.invoiceNumber, s.dueDate || s.invoiceDate, s.balanceDue, s.grandTotal]);
        const payablesRows = purchases
          .filter((p) => (p.balanceDue || 0) > 0)
          .map((p) => ["Supplier Payable", p.supplierName, p.purchaseNumber, p.expectedDate || p.purchaseDate, p.balanceDue, p.grandTotal]);
        rows = [...receivablesRows, ...payablesRows];
        break;
      case "channels":
        headers = ["Sales Channel", "Orders Count", "Gross Revenue ($)"];
        rows = channelPerformance.map((c) => [c.name, c.orders, c.value]);
        break;
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
              <FileSpreadsheet size={12} />
              Financial & Audit Ledger
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Financial & Operational Reports
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Audit sales, procurement costs, gross profit margins, inventory valuations, and accounts aging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <DateRangeFilter
            value={timeRange}
            onChange={setTimeRange}
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={setCustomStartDate}
            onEndDateChange={setCustomEndDate}
          />

          <Link
            href="/insights"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--foreground)] shadow-2xs transition hover:bg-[var(--muted-background)] whitespace-nowrap"
          >
            <TrendingUp size={14} className="text-[var(--primary)]" />
            <span>Visual Insights</span>
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 text-xs! font-semibold text-white! shadow-2xs transition hover:bg-[var(--primary-dark)] whitespace-nowrap"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* High-level Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sales Revenue"
          numberValue={totalSalesRevenue}
          isLoading={isLoading}
          subtext={`${invoices.length} issued invoices`}
          badge="Revenue"
        />
        <MetricCard
          label="Gross Profit"
          numberValue={grossProfit}
          isLoading={isLoading}
          subtext={`${profitMargin.toFixed(1)}% gross margin`}
          badge="Profit"
          badgeColor="text-emerald-700 bg-emerald-50"
        />
        <MetricCard
          label="Customer Receivables"
          numberValue={totalReceivables}
          isLoading={isLoading}
          subtext="Uncollected customer balances"
          badge="Receivables"
          badgeColor="text-amber-700 bg-amber-50"
        />
        <MetricCard
          label="Supplier Payables"
          numberValue={totalPayables}
          isLoading={isLoading}
          subtext="Pending purchase obligations"
          badge="Payables"
          badgeColor="text-blue-700 bg-blue-50"
        />
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border)] pb-2 text-xs sm:text-sm font-medium">
        <button
          onClick={() => { setActiveTab("sales"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "sales"
              ? "bg-[var(--primary)] text-white! shadow-xs"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <FileText size={16} />
          <span>Sales Register</span>
        </button>

        <button
          onClick={() => { setActiveTab("purchases"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "purchases"
              ? "bg-[var(--primary)] text-white! shadow-xs"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <ShoppingCart size={16} />
          <span>Purchase Register</span>
        </button>

        <button
          onClick={() => { setActiveTab("profit-loss"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "profit-loss"
              ? "bg-[var(--primary)] text-white! shadow-xs"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <TrendingUp size={16} />
          <span>Profit & Loss</span>
        </button>

        <button
          onClick={() => { setActiveTab("inventory"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "inventory"
              ? "bg-[var(--primary)] text-white! shadow-xs"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <Warehouse size={16} />
          <span>Stock Valuation</span>
        </button>

        <button
          onClick={() => { setActiveTab("outstanding"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "outstanding"
              ? "bg-[var(--primary)] text-white! shadow-xs"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <DollarSign size={16} />
          <span>Outstanding Balances</span>
        </button>

        <button
          onClick={() => { setActiveTab("channels"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "channels"
              ? "bg-[var(--primary)] text-white! shadow-xs"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <Store size={16} />
          <span>Channels Audit</span>
        </button>
      </div>

      {/* Tab 1: Sales Report */}
      {activeTab === "sales" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice #, customer name, channel..."
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[var(--primary)]"
              />
            </div>
            <p className="text-xs text-[var(--muted)]">
              Showing {invoices.length} invoices
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)] text-[var(--muted)] uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Customer / Buyer</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3 text-right">Invoice Total</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-right">Balance Due</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-[var(--muted)]">
                      No sales invoice records available for this filter period.
                    </td>
                  </tr>
                ) : (
                  invoices
                    .filter((s) =>
                      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                      s.buyerName.toLowerCase().includes(search.toLowerCase()) ||
                      (s.salesChannelName || "").toLowerCase().includes(search.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-mono font-medium text-[var(--primary)]">{item.invoiceNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{item.invoiceDate}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.buyerName}</td>
                        <td className="px-4 py-3 text-slate-700">{item.salesChannelName || "Direct"}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          ${Number(item.grandTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700 font-medium">
                          ${Number(item.amountPaid).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-amber-700 font-semibold">
                          ${Number(item.balanceDue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            item.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-800"
                              : item.paymentStatus === "PARTIALLY_PAID"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-red-50 text-red-700"
                          }`}>
                            {item.paymentStatus || item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 2: Purchase Report */}
      {activeTab === "purchases" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PO #, supplier, or warehouse..."
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[var(--primary)]"
              />
            </div>
            <p className="text-xs text-[var(--muted)]">
              Showing {purchases.length} purchase orders
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)] text-[var(--muted)] uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3 text-right">PO Total</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-right">Payable Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-[var(--muted)]">
                      No purchase order records available for this filter period.
                    </td>
                  </tr>
                ) : (
                  purchases
                    .filter((p) =>
                      p.purchaseNumber.toLowerCase().includes(search.toLowerCase()) ||
                      p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
                      p.warehouseName.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-mono font-medium text-[var(--primary)]">{item.purchaseNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{item.purchaseDate}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.supplierName}</td>
                        <td className="px-4 py-3 text-slate-700">{item.warehouseName}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          ${Number(item.grandTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700 font-medium">
                          ${Number(item.amountPaid).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-amber-700 font-semibold">
                          ${Number(item.balanceDue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            item.status === "RECEIVED"
                              ? "bg-emerald-50 text-emerald-800"
                              : item.status === "ORDERED"
                              ? "bg-blue-50 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 3: Profit & Loss Statement */}
      {activeTab === "profit-loss" && (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs">
          <div className="mb-6 flex flex-col justify-between gap-2 border-b border-[var(--border-light)] pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Operating Income Statement (P&L)</h2>
              <p className="text-xs text-[var(--muted)]">Calculated gross profit margin and revenue breakdown</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              {profitMargin.toFixed(1)}% Gross Margin
            </span>
          </div>

          <div className="space-y-4 max-w-2xl text-xs sm:text-sm">
            <div className="flex justify-between border-b border-slate-100 py-2">
              <span className="font-semibold text-slate-900">Gross Commercial Sales Invoicing</span>
              <span className="font-mono font-bold text-slate-900">
                ${totalSalesRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-2">
              <span className="text-slate-600">Less: Estimated Cost of Goods Sold (COGS)</span>
              <span className="font-mono text-red-600">
                -${(totalSalesRevenue - grossProfit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 py-3 bg-slate-50 px-4 rounded-xl">
              <span className="font-bold text-slate-900 text-base">Gross Operating Profit</span>
              <span className="font-mono font-bold text-emerald-800 text-base">
                ${grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Inventory Valuation */}
      {activeTab === "inventory" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product name, SKU..."
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[var(--primary)]"
              />
            </div>
            <p className="text-xs text-[var(--muted)]">
              Showing {inventory.length} inventory products
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)] text-[var(--muted)] uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">On-Hand Stock</th>
                  <th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Inventory Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[var(--muted)]">
                      No inventory valuation records found.
                    </td>
                  </tr>
                ) : (
                  inventory
                    .filter((i) =>
                      i.productName.toLowerCase().includes(search.toLowerCase()) ||
                      i.sku.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.productName}</td>
                        <td className="px-4 py-3 font-mono font-medium text-[var(--primary)]">{item.sku}</td>
                        <td className="px-4 py-3 text-slate-600">{item.category || "Standard"}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{item.onHand} {item.uom || "units"}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          ${Number(item.unitCost).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                          ${Number(item.inventoryValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 5: Outstanding Balances */}
      {activeTab === "outstanding" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="p-4 border-b border-[var(--border-light)]">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Aging Accounts: Receivables & Payables</h2>
            <p className="text-xs text-[var(--muted)]">Combined ledger of uncollected invoices and supplier balances</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)] text-[var(--muted)] uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Ledger Type</th>
                  <th className="px-4 py-3">Counterparty Name</th>
                  <th className="px-4 py-3">Document Reference</th>
                  <th className="px-4 py-3">Due / Order Date</th>
                  <th className="px-4 py-3 text-right">Balance Due</th>
                  <th className="px-4 py-3 text-right">Total Obligation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {invoices.filter((s) => (s.balanceDue || 0) > 0).map((inv) => (
                  <tr key={`inv-${inv.id}`} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                        Receivable
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{inv.buyerName}</td>
                    <td className="px-4 py-3 font-mono text-[var(--primary)]">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.dueDate || inv.invoiceDate}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">
                      ${Number(inv.balanceDue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      ${Number(inv.grandTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {purchases.filter((p) => (p.balanceDue || 0) > 0).map((po) => (
                  <tr key={`po-${po.id}`} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                        Payable
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{po.supplierName}</td>
                    <td className="px-4 py-3 font-mono text-[var(--primary)]">{po.purchaseNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{po.expectedDate || po.purchaseDate}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                      ${Number(po.balanceDue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      ${Number(po.grandTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {invoices.filter((s) => (s.balanceDue || 0) > 0).length === 0 &&
                  purchases.filter((p) => (p.balanceDue || 0) > 0).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-[var(--muted)]">
                        No outstanding balances due at this time.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 6: Channels Audit */}
      {activeTab === "channels" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="p-4 border-b border-[var(--border-light)]">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Omnichannel Revenue Audit</h2>
            <p className="text-xs text-[var(--muted)]">Breakdown of gross revenue generated across all sales portals</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)] text-[var(--muted)] uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Sales Channel</th>
                  <th className="px-4 py-3 text-right">Orders Logged</th>
                  <th className="px-4 py-3 text-right">Gross Channel Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {channelPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-sm text-[var(--muted)]">
                      No channel breakdown metrics available yet.
                    </td>
                  </tr>
                ) : (
                  channelPerformance.map((ch, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                        <Store size={14} className="text-slate-400" />
                        <span>{ch.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">{ch.orders} orders</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                        ${Number(ch.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  label,
  numberValue,
  isLoading,
  subtext,
  badge,
  badgeColor = "text-[var(--primary)] bg-[var(--primary-light)]",
}: {
  label: string;
  numberValue: number;
  isLoading: boolean;
  subtext: string;
  badge: string;
  badgeColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeColor}`}>{badge}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {isLoading ? (
          <span className="text-[var(--muted)]">—</span>
        ) : (
          <CountUp value={numberValue} prefix="$" decimals={2} />
        )}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">{subtext}</p>
    </div>
  );
}
