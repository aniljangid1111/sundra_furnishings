import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Package,
} from "lucide-react";

import { products } from "@/features/products/product.data";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    notFound();
  }

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

        <Link
          href={`/products/edit/${product.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)]"
        >
          <Edit size={16} />
          Edit Product
        </Link>
      </div>

      {/* Main */}
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Image */}
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
            <h2 className="text-lg font-semibold">
              {product.name}
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
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
              <InfoItem
                label="Product Name"
                value={product.name}
              />

              <InfoItem
                label="SKU"
                value={product.sku}
              />

              <InfoItem
                label="Category"
                value={product.category}
              />

              <InfoItem
                label="Unit of Measure"
                value={product.uom}
              />

              <InfoItem
                label="Reorder Level"
                value={String(product.reorderLevel)}
              />

              <InfoItem
                label="Status"
                value={
                  product.status === "ACTIVE"
                    ? "Active"
                    : "Inactive"
                }
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
                value={`$${product.costPrice.toFixed(2)}`}
              />

              <InfoItem
                label="Selling Price"
                value={`$${product.sellingPrice.toFixed(2)}`}
              />

              <InfoItem
                label="Tax Rate"
                value={`${product.taxRate.toFixed(2)}%`}
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
              <InfoItem
                label="Current Stock"
                value={String(product.stock)}
              />

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
              {product.salesChannels.length > 0 ? (
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
    <div>
      <h2 className="text-base font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-[var(--muted)]">
        {description}
      </p>
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
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "ACTIVE" | "INACTIVE";
}) {
  const active = status === "ACTIVE";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-[#e7f5ef] text-[var(--primary)]"
          : "bg-[var(--muted-background)] text-[var(--muted)]"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}