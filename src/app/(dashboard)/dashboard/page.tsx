"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const stats = [
  {
    title: "Total Sales",
    value: "$48,250",
    change: "+12.5%",
    description: "vs last month",
    positive: true,
  },
  {
    title: "Gross Profit",
    value: "$26,410",
    change: "+15.4%",
    description: "vs last month",
    positive: true,
  },
  {
    title: "Outstanding",
    value: "$12,680",
    change: "18 invoices",
    description: "pending payment",
    positive: null,
  },
  {
    title: "Inventory Value",
    value: "$184,620",
    change: "428 products",
    description: "current stock value",
    positive: null,
  },
];

const recentInvoices = [
  {
    invoice: "INV-1024",
    customer: "Urban Living Co.",
    date: "Oct 18, 2026",
    amount: "$4,280",
    status: "Paid",
  },
  {
    invoice: "INV-1023",
    customer: "Modern Home LLC",
    date: "Oct 17, 2026",
    amount: "$2,850",
    status: "Pending",
  },
  {
    invoice: "INV-1022",
    customer: "Oak & Stone",
    date: "Oct 16, 2026",
    amount: "$6,420",
    status: "Paid",
  },
  {
    invoice: "INV-1021",
    customer: "Casa Interiors",
    date: "Oct 15, 2026",
    amount: "$1,980",
    status: "Overdue",
  },
];

const lowStock = [
  {
    product: "Luna Accent Chair",
    sku: "CHR-001",
    stock: 3,
    reorder: 10,
  },
  {
    product: "Oak Side Table",
    sku: "TBL-014",
    stock: 5,
    reorder: 12,
  },
  {
    product: "Linen Cushion Set",
    sku: "CUS-021",
    stock: 7,
    reorder: 15,
  },
];

const salesData = [
  { month: "Jan", sales: 42000 },
  { month: "Feb", sales: 55000 },
  { month: "Mar", sales: 48000 },
  { month: "Apr", sales: 62000 },
  { month: "May", sales: 58000 },
  { month: "Jun", sales: 71000 },
  { month: "Jul", sales: 65000 },
  { month: "Aug", sales: 78000 },
  { month: "Sep", sales: 72000 },
  { month: "Oct", sales: 86000 },
  { month: "Nov", sales: 82000 },
  { month: "Dec", sales: 94000 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[28px]">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Monitor your sales, inventory and business performance.
          </p>
        </div>

        <button
          type="button"
          className="h-10 w-fit rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
        >
          October 2026
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="group rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[var(--muted)]">
                {stat.title}
              </p>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  stat.positive
                    ? "bg-[var(--primary-light)] text-[var(--primary)]"
                    : "bg-[var(--muted-background)] text-[var(--muted)]"
                }`}
              >
                {stat.change}
              </span>
            </div>

            <p className="mt-4 text-[28px] font-semibold tracking-tight text-[var(--foreground)]">
              {stat.value}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Sales + Inventory */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Sales chart */}
        <section className="min-w-0 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">
                Sales performance
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Monthly sales performance
              </p>
            </div>

            <select
              defaultValue="2026"
              className="h-9 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-medium text-[var(--muted)] outline-none transition focus:border-[var(--primary)]"
            >
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>

          <div className="mt-6 h-[260px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{
                  top: 10,
                  right: 5,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#176b52"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="100%"
                      stopColor="#176b52"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="#edf1ef"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#718078",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#718078",
                    fontSize: 11,
                  }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />

                <Tooltip
                  contentStyle={{
                    border: "1px solid #e3e9e6",
                    borderRadius: "12px",
                    boxShadow:
                      "0 8px 24px rgba(24, 33, 29, 0.08)",
                  }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Sales",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#176b52"
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#176b52",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Inventory summary */}
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">
              Inventory summary
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Current inventory position
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-[var(--muted-background)] p-5">
            <p className="text-xs font-medium text-[var(--muted)]">
              Inventory value
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              $184,620
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Across all warehouses
            </p>
          </div>

          <div className="mt-5 divide-y divide-[var(--border-light)]">
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-[var(--muted)]">
                Total products
              </span>

              <span className="font-semibold text-[var(--foreground)]">
                428
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-[var(--muted)]">
                In stock
              </span>

              <span className="font-semibold text-[var(--primary)]">
                392
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-[var(--muted)]">
                Low stock
              </span>

              <span className="font-semibold text-[var(--warning)]">
                36
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Recent invoices + Low stock */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent invoices */}
        <section className="min-w-0 rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">
                Recent invoices
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Latest customer invoices
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
            <table className="w-full min-w-[650px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-left">
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
                {recentInvoices.map((invoice) => (
                  <tr
                    key={invoice.invoice}
                    className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--muted-background)]"
                  >
                    <td className="px-5 py-4 font-medium text-[var(--foreground)]">
                      {invoice.invoice}
                    </td>

                    <td className="px-5 py-4 text-[var(--muted)]">
                      {invoice.customer}
                    </td>

                    <td className="px-5 py-4 text-[var(--muted)]">
                      {invoice.date}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-[var(--foreground)]">
                      {invoice.amount}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          invoice.status === "Paid"
                            ? "bg-[var(--primary-light)] text-[var(--primary)]"
                            : invoice.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Low stock */}
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
            {lowStock.map((product) => {
              const stockPercentage = Math.min(
                (product.stock / product.reorder) * 100,
                100,
              );

              return (
                <div
                  key={product.sku}
                  className="p-4 transition-colors hover:bg-[var(--muted-background)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {product.product}
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        SKU: {product.sku}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Low stock
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-[var(--muted)]">
                        Stock level
                      </span>

                      <span className="font-medium text-[var(--foreground)]">
                        {product.stock} / {product.reorder}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted-background)]">
                      <div
                        className="h-full rounded-full bg-[var(--warning)]"
                        style={{
                          width: `${stockPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}