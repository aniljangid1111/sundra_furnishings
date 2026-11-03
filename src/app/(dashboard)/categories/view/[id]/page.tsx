"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit,
  Loader2,
  Package,
  Tag,
  XCircle,
} from "lucide-react";

import { getCategoryByIdApi } from "@/lib/api/category.api";
import { PermissionGate } from "@/lib/auth/permissions";
import type { Category, CategoryStatus } from "@/features/categories/category.types";

export default function CategoryViewPage() {
  const params = useParams();
  const id = params?.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    getCategoryByIdApi(id)
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setCategory(res.data);
        } else {
          setError(res.message || "Category not found");
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err.message || "Failed to load category");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
          <p className="text-sm font-medium">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Category Not Found
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {error || "The category you are looking for does not exist or has been removed."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/categories"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-xs font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <ArrowLeft size={14} /> Back to Categories
          </Link>
        </div>
      </div>
    );
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

        <PermissionGate module="categories" action="edit">
          <Link
            href={`/categories/edit/${category.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)]"
          >
            <Edit size={16} />
            Edit Category
          </Link>
        </PermissionGate>
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
              value={String(category.productCount ?? 0)}
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
              value={String(category.productCount ?? 0)}
            />

            <SummaryRow
              label="Status"
              value={isActive ? "Active" : "Inactive"}
            />
          </div>

          <div className="border-t border-[var(--border)] p-5">
            <Link
              href={`/products?categoryId=${category.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--muted-background)]"
            >
              <Package size={16} />
              View Products
            </Link>
          </div>
        </section>
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
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>

      <div className="mt-1 text-sm font-medium text-[var(--foreground)]">
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
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-[var(--muted)]">
        {label}
      </span>

      <span className="font-medium text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: CategoryStatus;
}) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-zinc-200 bg-zinc-100 text-zinc-600"
      }`}
    >
      {isActive ? (
        <CheckCircle2 size={12} className="text-emerald-500" />
      ) : (
        <XCircle size={12} className="text-zinc-400" />
      )}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
