"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit,
  Loader2,
  Package,
  XCircle,
} from "lucide-react";

import { getProductByIdApi } from "@/lib/api/product.api";
import { PermissionGate } from "@/lib/auth/permissions";
import type { Product } from "@/features/products/product.types";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    getProductByIdApi(id)
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError(res.message || "Product not found");
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err.message || "Failed to load product details");
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
          <p className="text-sm font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Product Not Found
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {error ||
            "The product you are looking for does not exist or has been removed."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-xs font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <ArrowLeft size={14} /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const categoryName =
    typeof product.category === "object" && product.category
      ? product.category.name
      : typeof product.category === "string"
      ? product.category
      : "Unassigned";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/products"
            className="mb-2 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={16} />
            Back to products
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight">
            Product Details
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            View product information, pricing and sales channels.
          </p>
        </div>

        <PermissionGate module="products" action="edit">
          <Link
            href={`/products/edit/${product.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)]"
          >
            <Edit size={16} />
            Edit Product
          </Link>
        </PermissionGate>
      </div>

      {/* Main */}
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Image Card */}
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--muted-background)]">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="320px"
                className="object-contain p-8"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package
                  size={48}
                  strokeWidth={1.5}
                  className="text-[var(--muted)]"
                />
              </div>
            )}
          </div>

          <div className="mt-5">
            <h2 className="text-lg font-semibold">{product.name}</h2>

            <p className="mt-1 font-mono text-sm text-[var(--muted)]">
              SKU: {product.sku}
            </p>

            <div className="mt-3">
              <StatusBadge status={product.status} />
            </div>
          </div>
        </section>

        {/* Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <SectionTitle
              title="Basic Information"
              description="Core product details."
            />

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Product Name" value={product.name} />

              <InfoItem label="SKU" value={product.sku} />

              <InfoItem label="Category" value={categoryName} />

              <InfoItem label="Unit of Measure" value={product.uom} />

              <InfoItem
                label="Reorder Level"
                value={String(product.reorderLevel)}
              />

              <InfoItem
                label="Status"
                value={product.status === "ACTIVE" ? "Active" : "Inactive"}
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <SectionTitle
              title="Pricing & Tax"
              description="Product cost, selling price and tax settings."
            />

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label="Cost Price"
                value={`$${Number(product.costPrice || 0).toFixed(2)}`}
              />

              <InfoItem
                label="Selling Price"
                value={`$${Number(product.sellingPrice || 0).toFixed(2)}`}
              />

              <InfoItem
                label="Tax Rate"
                value={`${Number(product.taxRate || 0).toFixed(2)}%`}
              />
            </div>
          </section>

          {/* Inventory */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <SectionTitle
              title="Inventory"
              description="Current stock position."
            />

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoItem label="Current Stock" value={String(product.stock)} />

              <InfoItem
                label="Reorder Level"
                value={String(product.reorderLevel)}
              />
            </div>
          </section>

          {/* Sales Channels */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <SectionTitle
              title="Sales Channels"
              description="Platforms where this product is currently listed."
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {product.salesChannels && product.salesChannels.length > 0 ? (
                product.salesChannels.map((channel) => (
                  <span
                    key={channel}
                    className="rounded-lg bg-[var(--primary-light)] px-3 py-2 text-sm font-medium text-[var(--primary)]"
                  >
                    {channel}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  This product is not listed on any sales channel.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[var(--border-light)] pb-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Product["status"];
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
