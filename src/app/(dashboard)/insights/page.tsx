"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  FileText,
  Package,
  ShoppingBag,
  TrendingUp,
  Warehouse,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTooltip } from "@/components/ui/tooltip";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { getDashboardInsightsApi, type DashboardInsights } from "@/lib/api/insight.api";
import { CountUp } from "@/components/ui/count-up";

type TimeRange = "TODAY" | "7D" | "30D" | "CUSTOM" | "ALL";

const channelPalette = ["#047857", "#2563eb", "#d97706", "#7c3aed", "#e11d48", "#0891b2"];

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [customStartDate, setCustomStartDate] = useState("2026-10-01");
  const [customEndDate, setCustomEndDate] = useState("2026-10-28");
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadInsights() {
      setIsLoading(true);
      try {
        const res = await getDashboardInsightsApi({
          timeRange: timeRange !== "ALL" ? timeRange : undefined,
          startDate: timeRange === "CUSTOM" && customStartDate ? customStartDate : undefined,
          endDate: timeRange === "CUSTOM" && customEndDate ? customEndDate : undefined,
        });
        if (res.success && res.data) {
          setInsights(res.data);
        }
      } catch (err) {
        console.error("Failed to load business insights", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInsights();
  }, [timeRange, customStartDate, customEndDate]);

  const channelData = useMemo(() => {
    return (insights?.channelBreakdown || []).map((ch, idx) => ({
      ...ch,
      color: channelPalette[idx % channelPalette.length],
    }));
  }, [insights]);

  const categoryData = useMemo(() => {
    return (insights?.categoryBreakdown || []).map((cat, idx) => ({
      ...cat,
      color: channelPalette[idx % channelPalette.length],
    }));
  }, [insights]);

  const bestSellers = insights?.bestSellingProducts || [];
  const monthlyRevenueTrends = insights?.monthlyTrends || [];

  // Metrics from API
  const currentRevenue = insights?.kpi.totalSales ?? 0;
  const currentProfit = insights?.kpi.grossProfit ?? 0;
  const capitalInStock = insights?.kpi.inventoryValue ?? 0;
  const averageOrderValue =
    insights && insights.kpi.totalInvoices > 0
      ? insights.kpi.totalSales / insights.kpi.totalInvoices
      : 0;
  const totalUnits = insights?.kpi.totalProducts ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              <TrendingUp size={12} />
              Executive Analytics
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Business Insights
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Visual trends, profit margins, sales channel performance, and stock health gauge.
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
            href="/reports"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--foreground)] shadow-2xs transition hover:bg-[var(--muted-background)] whitespace-nowrap"
          >
            <FileText size={14} className="text-[var(--primary)]" />
            <span>Detailed Reports</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightStatCard
          label="Total Net Revenue"
          value={currentRevenue}
          isCurrency
          isLoading={isLoading}
          change={currentRevenue > 0 ? "+100%" : "0.0%"}
          changeDirection="neutral"
          subtext="in period"
          tooltip="Total invoiced sales revenue after deducting line item discounts."
          icon={CircleDollarSign}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
        />
        <InsightStatCard
          label="Gross Profit (COGS Deducted)"
          value={currentProfit}
          isCurrency
          isLoading={isLoading}
          change={`${insights?.kpi.profitMarginPercent ?? 0}%`}
          changeDirection="neutral"
          subtext="profit margin"
          tooltip="Gross Profit = Net Revenue minus manufacturing procurement base cost (COGS)."
          icon={TrendingUp}
          iconColor="text-blue-700"
          iconBg="bg-blue-50"
        />
        <InsightStatCard
          label="Capital in Stock"
          value={capitalInStock}
          isCurrency
          isLoading={isLoading}
          change={`${totalUnits} products`}
          changeDirection="neutral"
          subtext="across warehouses"
          tooltip="Total extended dollar value of physical inventory sitting across all fulfillment warehouses."
          icon={Warehouse}
          iconColor="text-amber-700"
          iconBg="bg-amber-50"
        />
        <InsightStatCard
          label="Average Order Value (AOV)"
          value={averageOrderValue}
          isCurrency
          isLoading={isLoading}
          change={`${insights?.kpi.totalInvoices ?? 0} orders`}
          changeDirection="neutral"
          subtext="invoices issued"
          tooltip="Average dollar value billed per completed customer invoice."
          tooltipAlign="end"
          icon={ShoppingBag}
          iconColor="text-indigo-700"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Primary Graphs Row: Revenue Curve & Channel Share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue & Margin Trend (2 cols) */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 lg:col-span-2 shadow-2xs">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  Revenue & Cost Trajectory
                </h2>
                <InfoTooltip content="Comparison between gross invoiced revenue and procurement cost basis (COGS) over time." />
              </div>
              <p className="text-xs text-[var(--muted)]">
                Trajectory of gross sales vs factory procurement cost.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                Landed Cost
              </span>
            </div>
          </div>

          <div className="mt-6 h-72 w-full">
            {!isMounted ? (
              <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Loading visual charts...</div>
            ) : monthlyRevenueTrends.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted)]">
                <BarChart3 size={28} className="text-[var(--muted)]/50" />
                <p className="mt-2 font-medium text-[var(--foreground)]">No revenue trajectory data available yet</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">Trends will plot automatically once sales invoices are logged.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyRevenueTrends}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#047857"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    fillOpacity={1}
                    fill="url(#costGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales Channel Share (1 col) */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Sales Channel Share
            </h2>
            <InfoTooltip content="Proportion of total invoiced volume generated across selling platforms." />
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Revenue distribution across sales portals.
          </p>

          <div className="relative mt-6 flex h-48 w-full items-center justify-center">
            {!isMounted ? (
              <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Loading channel share...</div>
            ) : channelData.length === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted)]">
                <PieIcon size={26} className="text-[var(--muted)]/50" />
                <p className="mt-2 text-xs font-medium text-[var(--foreground)]">No channel data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-[var(--border-light)] pt-3 text-xs">
            {channelData.length === 0 ? (
              <p className="text-center text-xs text-[var(--muted)] py-2">No active channel transactions</p>
            ) : (
              channelData.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="font-medium text-[var(--foreground)]">{c.name}</span>
                  </span>
                  <span className="font-semibold text-slate-700">
                    ${c.value.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Category Performance & Stock Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Performance Bar (2 cols) */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 lg:col-span-2 shadow-2xs">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  Category Sales Velocity
                </h2>
                <InfoTooltip content="Aggregated gross sales volume and share per product category based on fulfilled orders." />
              </div>
              <p className="text-xs text-[var(--muted)]">
                Color-coded revenue breakdown across Sundara product segments.
              </p>
            </div>
          </div>

          <div className="mt-6 h-64 w-full">
            {!isMounted ? (
              <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Loading category metrics...</div>
            ) : categoryData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted)]">
                <Layers size={28} className="text-[var(--muted)]/50" />
                <p className="mt-2 font-medium text-[var(--foreground)]">No category sales recorded</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">Sales velocity appears here once products in categories are sold.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {categoryData.map((cat) => (
                      <Cell key={cat.category} fill={cat.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stock Health Gauge (1 col) */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Stock Health Status
            </h2>
            <InfoTooltip content="Overall distribution of active inventory catalog across stock thresholds." />
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Distribution across replenishment thresholds.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center rounded-xl bg-slate-50 p-6 text-center">
            <Package size={32} className="text-[var(--muted)]/50" />
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">0 Total Units Tracked</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">All warehouse inventories are currently at zero</p>
          </div>

          <div className="mt-5 border-t border-[var(--border-light)] pt-3">
            <Link
              href="/inventory"
              className="inline-flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted-background)]"
            >
              <span>Manage Warehouse Stock</span>
              <ArrowRight size={14} className="text-[var(--primary)]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Best-Selling Products Matrix Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--border-light)] p-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Top Products by Profit & Revenue
              </h2>
              <InfoTooltip content="Ranked ranking of furniture SKUs calculated from paid invoices and cost basis." />
            </div>
            <p className="text-xs text-[var(--muted)]">
              Ranked furniture & furnishings items driven by fulfilled client invoices.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[var(--muted-background)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3.5 font-medium">Rank & Product</th>
                <th className="px-5 py-3.5 font-medium">SKU</th>
                <th className="px-5 py-3.5 text-center font-medium">Units Sold</th>
                <th className="px-5 py-3.5 text-right font-medium">Gross Revenue</th>
                <th className="px-5 py-3.5 text-right font-medium">Unit Cost</th>
                <th className="px-5 py-3.5 text-right font-medium">Gross Margin</th>
                <th className="px-5 py-3.5 text-center font-medium">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                    <p className="font-medium text-[var(--foreground)]">No sales data available for ranking</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">Top performing items will populate as orders are invoiced.</p>
                  </td>
                </tr>
              ) : (
                bestSellers.map((prod, idx) => (
                  <tr key={prod.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-medium text-slate-800">#{idx + 1} {prod.name}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">{prod.sku}</td>
                    <td className="px-5 py-4 text-center font-medium">{prod.unitsSold}</td>
                    <td className="px-5 py-4 text-right font-semibold text-emerald-800">${prod.revenue.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right text-xs text-slate-500">${prod.costPrice.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-800">{prod.marginPercent}%</td>
                    <td className="px-5 py-4 text-center font-medium">{prod.onHandStock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InsightStatCard({
  label,
  value,
  isCurrency = false,
  isLoading = false,
  change,
  changeDirection = "neutral",
  subtext,
  tooltip,
  tooltipAlign = "start",
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  isLoading?: boolean;
  change: string;
  changeDirection?: "up" | "down" | "neutral";
  subtext: string;
  tooltip?: string;
  tooltipAlign?: "start" | "end";
  icon: any;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</p>
          {tooltip && <InfoTooltip content={tooltip} align={tooltipAlign} />}
        </div>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={18} />
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
        <CountUp
          value={value}
          prefix={isCurrency ? "$" : ""}
          decimals={isCurrency ? 2 : 0}
          isLoading={isLoading}
        />
      </p>

      <div className="mt-1 flex items-center gap-1.5 text-xs">
        <span className="font-semibold text-slate-600">{change}</span>
        <span className="text-[var(--muted)]">• {subtext}</span>
      </div>
    </div>
  );
}
