"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { products } from "@/features/products/product.data";
import type { Product } from "@/features/products/product.types";

const salesChannels = ["Website", "Amazon", "Wayfair"];

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>(products);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [channel, setChannel] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [imageProduct, setImageProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const categories = useMemo(
    () => [...new Set(productList.map((product) => product.category))],
    [productList],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return productList.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);

      const matchesCategory =
        category === "ALL" || product.category === category;

      const matchesChannel =
        channel === "ALL" || product.salesChannels.includes(channel);

      const matchesStatus =
        status === "ALL" || product.status === status;

      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && product.stock > product.reorderLevel) ||
        (stockFilter === "LOW_STOCK" &&
          product.stock > 0 &&
          product.stock <= product.reorderLevel) ||
        (stockFilter === "OUT_OF_STOCK" && product.stock === 0);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesChannel &&
        matchesStatus &&
        matchesStock
      );
    });
  }, [
    productList,
    search,
    category,
    channel,
    stockFilter,
    status,
  ]);

  const totalProducts = productList.length;

  const activeProducts = productList.filter(
    (product) => product.status === "ACTIVE",
  ).length;

  const lowStockProducts = productList.filter(
    (product) =>
      product.stock > 0 && product.stock <= product.reorderLevel,
  ).length;

  const outOfStockProducts = productList.filter(
    (product) => product.stock === 0,
  ).length;

  const handleDelete = () => {
    if (!deleteProduct) return;

    setProductList((current) =>
      current.filter((product) => product.id !== deleteProduct.id),
    );

    setDeleteProduct(null);
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            Management
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Products
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your products, pricing and stock settings.
          </p>
        </div>

        <Link
          href="/products/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Add product
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total products" value={totalProducts} />
        <SummaryCard label="Active products" value={activeProducts} />
        <SummaryCard label="Low stock" value={lowStockProducts} />
        <SummaryCard label="Out of stock" value={outOfStockProducts} />
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {/* Filters */}
        <div className="border-b border-[var(--border-light)] p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_180px_160px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or SKU..."
                className="form-input !pl-10"
              />
            </div>

            <FilterSelect
              value={category}
              onChange={setCategory}
              options={[
                { value: "ALL", label: "All categories" },
                ...categories.map((item) => ({
                  value: item,
                  label: item,
                })),
              ]}
            />

            <FilterSelect
              value={channel}
              onChange={setChannel}
              options={[
                { value: "ALL", label: "All platforms" },
                ...salesChannels.map((item) => ({
                  value: item,
                  label: item,
                })),
              ]}
            />

            <FilterSelect
              value={stockFilter}
              onChange={setStockFilter}
              options={[
                { value: "ALL", label: "All stock" },
                { value: "IN_STOCK", label: "In stock" },
                { value: "LOW_STOCK", label: "Low stock" },
                { value: "OUT_OF_STOCK", label: "Out of stock" },
              ]}
            />

            <FilterSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "ALL", label: "All status" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[#fafcfb]">
                <TableHead>PRODUCT</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>PRICE</TableHead>
                <TableHead>STOCK</TableHead>
                <TableHead>PLATFORMS</TableHead>
                <TableHead>TAX</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="w-16"> </TableHead>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted-background)] text-[var(--muted)]">
                        <Package size={22} />
                      </div>

                      <p className="mt-4 text-sm font-medium">
                        No products found
                      </p>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    menuOpen={openMenuId === product.id}
                    onToggleMenu={() =>
                      setOpenMenuId((current) =>
                        current === product.id ? null : product.id,
                      )
                    }
                    onCloseMenu={() => setOpenMenuId(null)}
                    onImageClick={() => setImageProduct(product)}
                    onDelete={() => setDeleteProduct(product)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview */}
      {imageProduct && (
        <ImagePreviewModal
          product={imageProduct}
          onClose={() => setImageProduct(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function ProductRow({
  product,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onImageClick,
  onDelete,
}: {
  product: Product;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onImageClick: () => void;
  onDelete: () => void;
}) {
  const isLowStock =
    product.stock > 0 && product.stock <= product.reorderLevel;

  const isOutOfStock = product.stock === 0;

  return (
    <tr className="border-b border-[var(--border-light)] last:border-b-0 hover:bg-[#fbfdfc]">
      {/* Product */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onImageClick}
            className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[#f4f7f5]"
            title="View product image"
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="48px"
                className="object-contain p-1 transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                <Package size={18} />
              </div>
            )}
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">
              {product.name}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {product.uom}
            </p>
          </div>
        </div>
      </td>

      {/* SKU */}
      <td className="px-6 py-4 text-sm text-[var(--muted)]">
        {product.sku}
      </td>

      {/* Category */}
      <td className="px-6 py-4 text-sm text-[var(--muted)]">
        {product.category}
      </td>

      {/* Price */}
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-[var(--foreground)]">
          ${product.sellingPrice.toFixed(2)}
        </p>

        <p className="mt-1 text-xs text-[var(--muted)]">
          Cost ${product.costPrice.toFixed(2)}
        </p>
      </td>

      {/* Stock */}
      <td className="px-6 py-4">
        <p className="text-sm font-medium">{product.stock}</p>

        {isLowStock && (
          <p className="mt-1 text-xs text-[var(--warning)]">
            Low stock
          </p>
        )}

        {isOutOfStock && (
          <p className="mt-1 text-xs text-[var(--danger)]">
            Out of stock
          </p>
        )}
      </td>

      {/* Platforms */}
      <td className="px-6 py-4">
        <div className="flex max-w-[180px] flex-wrap gap-1.5">
          {product.salesChannels.length === 0 ? (
            <span className="text-xs text-[var(--muted)]">
              Not listed
            </span>
          ) : (
            product.salesChannels.slice(0, 2).map((channel) => (
              <span
                key={channel}
                className="rounded-md bg-[var(--muted-background)] px-2 py-1 text-[11px] font-medium text-[var(--muted)]"
              >
                {channel}
              </span>
            ))
          )}

          {product.salesChannels.length > 2 && (
            <span className="rounded-md bg-[var(--primary-light)] px-2 py-1 text-[11px] font-medium text-[var(--primary)]">
              +{product.salesChannels.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Tax */}
      <td className="px-6 py-4 text-sm text-[var(--muted)]">
        {product.taxRate.toFixed(2)}%
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={product.status} />
      </td>

      {/* Actions */}
      <td className="relative px-6 py-4 text-right">
        <button
          type="button"
          onClick={onToggleMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          aria-label={`Actions for ${product.name}`}
        >
          <MoreHorizontal size={19} />
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close action menu"
              onClick={onCloseMenu}
              className="fixed inset-0 z-30 cursor-default"
            />

            <div className="absolute right-5 top-12 z-40 w-44 rounded-xl border border-[var(--border)] bg-white p-1.5 text-left shadow-lg">
              <Link
                href={`/products/view/${product.id}`}
                onClick={onCloseMenu}
                className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
              >
                <Eye size={16} />
                View
              </Link>

              <Link
                href={`/products/edit/${product.id}`}
                onClick={onCloseMenu}
                className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
              >
                <Pencil size={16} />
                Edit
              </Link>

              <button
                type="button"
                onClick={onDelete}
                className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[var(--danger)] hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Product["status"];
}) {
  const active = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-[#e7f5ef] text-[var(--primary)]"
          : "bg-[#f1f3f2] text-[var(--muted)]"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input appearance-none pr-10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      />
    </div>
  );
}

function TableHead({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-3 text-left text-[11px] font-medium tracking-[0.08em] text-[var(--muted)] ${className}`}
    >
      {children}
    </th>
  );
}

function ImagePreviewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--muted)] shadow-md hover:text-[var(--foreground)]"
          aria-label="Close image preview"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f4f7f5]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="600px"
              className="object-contain p-8"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--muted)]">
              <Package size={48} />
            </div>
          )}
        </div>

        <div className="px-2 pb-2 pt-4">
          <p className="text-base font-semibold">{product.name}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {product.sku}
          </p>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-5"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[var(--danger)]">
          <Trash2 size={20} />
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          Delete product?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Are you sure you want to delete{" "}
          <span className="font-medium text-[var(--foreground)]">
            {product.name}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--muted-background)]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-lg bg-[var(--danger)] px-4 text-sm font-medium text-white hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}