"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  PieChart,
  Search,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import {
  getChannelPerformance,
  getInventoryValuationReport,
  getProfitAndLossSummary,
  getPurchaseReport,
  getSalesReport,
} from "@/features/reports/report.data";

type ReportTab = "sales" | "purchases" | "profit-loss" | "inventory" | "outstanding" | "channels";

export default function ReportsDashboardPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("ALL");

  const salesReport = getSalesReport();
  const purchaseReport = getPurchaseReport();
  const inventoryReport = getInventoryValuationReport();
  const channelPerformance = getChannelPerformance();
  const pnlSummary = getProfitAndLossSummary();

  // Receivables & Payables calculations
  const totalReceivables = salesReport.reduce((sum, item) => sum + item.balance, 0);
  const totalPayables = purchaseReport.reduce((sum, item) => sum + item.balance, 0);
  const totalInventoryValuation = inventoryReport.reduce((sum, item) => sum + item.totalValuation, 0);
  const totalSalesRevenue = salesReport.reduce((sum, item) => sum + item.total, 0);

  // Export report handler (CSV data export)
  const handleExportCSV = (reportName: string) => {
    alert(`Exporting ${reportName} data to CSV...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            Business Intelligence & Auditing
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Financial & Operational Reports
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Audit sales, purchases, cost of goods sold, profit margins, and warehouse valuations derived from shared ERP records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleExportCSV(activeTab.toUpperCase())}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted-background)]"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" />
            <span>Export Report CSV</span>
          </button>
        </div>
      </div>

      {/* High-level Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sales Revenue"
          value={`$${totalSalesRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtext={`${salesReport.length} issued invoices`}
          badge="Revenue"
        />
        <MetricCard
          label="Gross Profit"
          value={`$${pnlSummary.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtext={`${pnlSummary.grossProfitMargin}% gross margin`}
          badge="Profit"
          badgeColor="text-emerald-700 bg-emerald-50"
        />
        <MetricCard
          label="Customer Receivables"
          value={`$${totalReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtext="Uncollected customer balances"
          badge="Receivables"
          badgeColor="text-amber-700 bg-amber-50"
        />
        <MetricCard
          label="Supplier Payables"
          value={`$${totalPayables.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
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
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <FileText size={16} />
          <span>Sales Report</span>
        </button>

        <button
          onClick={() => { setActiveTab("purchases"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "purchases"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <ShoppingCart size={16} />
          <span>Purchase Report</span>
        </button>

        <button
          onClick={() => { setActiveTab("profit-loss"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "profit-loss"
              ? "bg-[var(--primary)] text-white shadow-sm"
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
              ? "bg-[var(--primary)] text-white shadow-sm"
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
              ? "bg-[var(--primary)] text-white shadow-sm"
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
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          }`}
        >
          <Store size={16} />
          <span>Channel Performance</span>
        </button>
      </div>

      {/* Tab 1: Sales Report */}
      {activeTab === "sales" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by invoice #, customer, or channel..."
                className="form-input pl-9 text-xs w-full"
              />
            </div>
            <p className="text-xs text-[var(--muted)]">
              Showing {salesReport.length} customer sales transactions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer / Buyer</th>
                  <th className="px-4 py-3 font-semibold">Channel</th>
                  <th className="px-4 py-3 text-right font-semibold">Invoice Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Collected</th>
                  <th className="px-4 py-3 text-right font-semibold">Balance Due</th>
                  <th className="px-4 py-3 text-center font-semibold">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {salesReport
                  .filter((s) => s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || s.customer.toLowerCase().includes(search.toLowerCase()) || s.channel.toLowerCase().includes(search.toLowerCase()))
                  .map((item) => (
                    <tr key={item.invoiceNumber} className="border-b border-[var(--border-light)] last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono font-medium text-[var(--primary)]">{item.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{item.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.customer}</td>
                      <td className="px-4 py-3 text-slate-700">{item.channel}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ${item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 font-medium">
                        ${item.paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-700 font-semibold">
                        ${item.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 2: Purchase Report */}
      {activeTab === "purchases" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PO #, supplier, or warehouse..."
                className="form-input pl-9 text-xs w-full"
              />
            </div>
            <p className="text-xs text-[var(--muted)]">
              Showing {purchaseReport.length} purchase orders
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">PO Number</th>
                  <th className="px-4 py-3 font-semibold">Order Date</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 font-semibold">Warehouse</th>
                  <th className="px-4 py-3 text-right font-semibold">PO Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount Paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Payable Balance</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseReport
                  .filter((p) => p.purchaseNumber.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase()) || p.warehouse.toLowerCase().includes(search.toLowerCase()))
                  .map((item) => (
                    <tr key={item.purchaseNumber} className="border-b border-[var(--border-light)] last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono font-medium text-[var(--primary)]">{item.purchaseNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{item.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.supplier}</td>
                      <td className="px-4 py-3 text-slate-700">{item.warehouse.split("(")[0]}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ${item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 font-medium">
                        ${item.paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-blue-700 font-semibold">
                        ${item.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 3: Profit & Loss Statement */}
      {activeTab === "profit-loss" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--foreground)] border-b border-[var(--border-light)] pb-4">
              Gross Profit & Revenue Audit
            </h2>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Gross Commercial Invoicing</span>
                <span className="font-mono font-semibold text-slate-900">
                  ${pnlSummary.grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 text-rose-700">
                <span>Less: Trade Discounts Given</span>
                <span className="font-mono font-semibold">
                  -${pnlSummary.discountsGiven.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2.5 border-b border-slate-200 font-bold text-slate-900 text-sm">
                <span>Net Sales Revenue</span>
                <span className="font-mono text-emerald-800">
                  ${pnlSummary.netRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                <span>Cost of Goods Sold (COGS - Product Base Costs)</span>
                <span className="font-mono font-semibold text-slate-900">
                  ${pnlSummary.costOfGoodsSold.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-3 border-t-2 border-slate-900 text-base font-extrabold text-slate-900">
                <span>Gross Commercial Profit</span>
                <span className="font-mono text-emerald-800">
                  ${pnlSummary.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 text-xs font-semibold text-slate-600">
                <span>Gross Profit Margin</span>
                <span className="rounded bg-emerald-50 px-2.5 py-0.5 text-emerald-700 font-mono text-xs">
                  {pnlSummary.grossProfitMargin}% Margin
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--foreground)] border-b border-[var(--border-light)] pb-4">
              Accounting Methodology & Transparency
            </h2>
            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900">Revenue Recognition:</strong> Derived strictly from issued customer invoices. Draft proposals and cancelled orders are excluded.
              </p>
              <p>
                <strong className="text-slate-900">Cost of Goods Sold (COGS):</strong> Calculated from the active product master catalog cost basis for all fulfilled line items.
              </p>
              <p>
                <strong className="text-slate-900">Net Profit Disclaimer:</strong> This statement reflects Gross Profit only. Operating expenses (rent, marketing, payroll) are not claimed since full double-entry ledger integration is pending backend implementation.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Tab 4: Inventory Stock Valuation */}
      {activeTab === "inventory" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] p-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Inventory Asset Valuation by SKU</h2>
              <p className="text-xs text-[var(--muted)]">Valuation based on weighted unit cost × on-hand warehouse stock</p>
            </div>
            <p className="text-sm font-bold text-emerald-800">
              Total Stock Asset Value: ${totalInventoryValuation.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Product Name</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">On-Hand Quantity</th>
                  <th className="px-4 py-3 text-right font-semibold">Unit Cost Basis</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Stock Valuation</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReport.map((item) => (
                  <tr key={item.productId} className="border-b border-[var(--border-light)] last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                    <td className="px-4 py-3 font-mono text-[var(--muted)]">{item.sku}</td>
                    <td className="px-4 py-3 text-slate-700">{item.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{item.onHand} units</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">${item.unitCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                      ${item.totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 5: Outstanding Balances */}
      {activeTab === "outstanding" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Receivables */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Outstanding Customer Receivables</h2>
                <p className="text-xs text-[var(--muted)]">Money owed to Sundara Furnishings</p>
              </div>
              <span className="font-mono text-sm font-bold text-amber-700">
                ${totalReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 text-xs">
              {salesReport.filter((s) => s.balance > 0).map((item) => (
                <div key={item.invoiceNumber} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-semibold text-slate-900">{item.customer}</p>
                    <p className="text-[11px] text-slate-500">{item.invoiceNumber} • Due {item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-amber-700">
                      ${item.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] text-slate-500">of ${item.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payables */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Outstanding Supplier Payables</h2>
                <p className="text-xs text-[var(--muted)]">Money Sundara Furnishings owes suppliers</p>
              </div>
              <span className="font-mono text-sm font-bold text-blue-700">
                ${totalPayables.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 text-xs">
              {purchaseReport.filter((p) => p.balance > 0).map((item) => (
                <div key={item.purchaseNumber} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-semibold text-slate-900">{item.supplier}</p>
                    <p className="text-[11px] text-slate-500">{item.purchaseNumber} • {item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-blue-700">
                      ${item.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] text-slate-500">of ${item.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab 6: Channel Performance */}
      {activeTab === "channels" && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="border-b border-[var(--border-light)] p-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Sales Channel Contribution & Order Value</h2>
            <p className="text-xs text-[var(--muted)]">Breakdown of gross invoicing across retail, web, and marketplace channels</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Sales Channel</th>
                  <th className="px-4 py-3 text-right font-semibold">Orders Count</th>
                  <th className="px-4 py-3 text-right font-semibold">Gross Revenue</th>
                  <th className="px-4 py-3 text-right font-semibold">Average Order Value (AOV)</th>
                </tr>
              </thead>
              <tbody>
                {channelPerformance.map((ch) => (
                  <tr key={ch.channelId} className="border-b border-[var(--border-light)] last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                      <Store size={14} className="text-slate-400" />
                      <span>{ch.channelName}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{ch.invoiceCount} orders</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                      ${ch.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      ${ch.averageOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
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
  value,
  subtext,
  badge,
  badgeColor = "text-[var(--primary)] bg-[var(--primary-light)]",
}: {
  label: string;
  value: string;
  subtext: string;
  badge: string;
  badgeColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{label}</p>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${badgeColor}`}>{badge}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{subtext}</p>
    </div>
  );
}
