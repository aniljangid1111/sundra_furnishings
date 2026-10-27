import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
} from "lucide-react";

import { categories } from "@/features/categories/category.data";

interface CategoryViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryViewPage({
  params,
}: CategoryViewPageProps) {
  const { id } = await params;

  const category = categories.find(
    (item) => item.id === Number(id),
  );

  if (!category) {
    notFound();
  }

  const isActive = category.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/categories"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
            aria-label="Back to categories"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {category.name}
              </h1>

              <StatusBadge status={category.status} />
            </div>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Category details and product assignment summary.
            </p>
          </div>
        </div>

        <Link
          href={`/categories/edit/${category.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
        >
          <Edit size={16} />
          Edit Category
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Category Information */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <Tag size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Category Information
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Basic information for this category.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <DetailItem
              label="Category Name"
              value={category.name}
            />

            <DetailItem
              label="Category Code"
              value={category.code}
            />

            <DetailItem
              label="Status"
              value={
                <StatusBadge
                  status={category.status}
                />
              }
            />

            <DetailItem
              label="Products Assigned"
              value={String(category.productCount)}
            />

            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Description
              </p>

              <div className="rounded-lg border border-[var(--border-light)] bg-[var(--muted-background)] p-4">
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  {category.description || "No description available."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <Package size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Category Summary
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Current category statistics.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[var(--border-light)] px-5">
            <SummaryRow
              label="Category"
              value={category.name}
            />

            <SummaryRow
              label="Code"
              value={category.code}
            />

            <SummaryRow
              label="Products"
              value={String(category.productCount)}
            />

            <SummaryRow
              label="Status"
              value={isActive ? "Active" : "Inactive"}
            />
          </div>

          <div className="border-t border-[var(--border)] p-5">
            <Link
              href="/products"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--muted-background)]"
            >
              <Package size={16} />
              View Products
            </Link>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-5 flex justify-end">
        <Link
          href="/categories"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
        >
          Back to Categories
        </Link>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>

      <div className="text-sm font-medium">
        {value}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-[var(--muted)]">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "ACTIVE" | "INACTIVE";
}) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-[var(--success)]"
          : "bg-gray-100 text-[var(--muted)]"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}