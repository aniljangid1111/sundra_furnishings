"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { Product, ProductKpi } from "@/features/products/product.types";
import type { Category } from "@/features/categories/category.types";
import { getProductsApi, deleteProductApi } from "@/lib/api/product.api";
import { getCategoriesApi } from "@/lib/api/category.api";
import { PermissionGate } from "@/lib/auth/permissions";
import { CountUp } from "@/components/ui/count-up";

const salesChannels = ["Website", "Amazon", "Wayfair"];

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [kpi, setKpi] = useState<ProductKpi>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalInventoryValue: 0,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedChannel, setSelectedChannel] = useState("ALL");
  const [selectedStock, setSelectedStock] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals & Menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [imageProduct, setImageProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch category dropdown options once
  useEffect(() => {
    getCategoriesApi({ limit: "all" })
      .then((res) => {
        if (res.success && res.data) {
          setCategoriesList(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories for filter", err);
      });
  }, []);

  // Fetch products with active filters
  const loadProducts = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const catId =
          selectedCategory !== "ALL" ? Number(selectedCategory) : undefined;

        const res = await getProductsApi({
          page: pageToLoad,
          limit: 10,
          search: search.trim() || undefined,
          categoryId: isNaN(catId as number) ? undefined : catId,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          channel: selectedChannel !== "ALL" ? selectedChannel : undefined,
          stockFilter: selectedStock !== "ALL" ? selectedStock : undefined,
        });

        if (res.success) {
          setProductList(res.data || []);
          if (res.kpi) {
            setKpi(res.kpi as ProductKpi);
          }
          if (res.pagination) {
            setPagination({
              currentPage: res.pagination.currentPage,
              totalPages: res.pagination.totalPages,
              totalItems: res.pagination.totalItems,
              hasNextPage: res.pagination.hasNextPage,
              hasPrevPage: res.pagination.hasPrevPage,
            });
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load products from server.");
      } finally {
        setIsLoading(false);
      }
    },
    [search, selectedCategory, selectedChannel, selectedStock, selectedStatus]
  );

  // Trigger search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setIsDeleting(true);

    try {
      await deleteProductApi(deleteProduct.id);
      setDeleteProduct(null);
      setOpenMenuId(null);
      loadProducts(pagination.currentPage);
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
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
            Manage your products catalogue, pricing, and live inventory.
          </p>
        </div>

        <PermissionGate module="products" action="create">
          <Link
            href="/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-medium text-white! shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            <Plus size={18} />
            Add product
          </Link>
        </PermissionGate>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total products" value={kpi.totalProducts} isLoading={isLoading} />
        <SummaryCard label="Active products" value={kpi.activeProducts} isLoading={isLoading} />
        <SummaryCard label="Low stock" value={kpi.lowStockProducts} isLoading={isLoading} />
        <SummaryCard label="Out of stock" value={kpi.outOfStockProducts} isLoading={isLoading} />
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{error}</p>
          <button
            onClick={() => loadProducts(pagination.currentPage)}
            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

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
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: "ALL", label: "All categories" },
                ...categoriesList.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                })),
              ]}
            />

            <FilterSelect
              value={selectedChannel}
              onChange={setSelectedChannel}
              options={[
                { value: "ALL", label: "All platforms" },
                ...salesChannels.map((item) => ({
                  value: item,
                  label: item,
                })),
              ]}
            />

            <FilterSelect
              value={selectedStock}
              onChange={setSelectedStock}
              options={[
                { value: "ALL", label: "All stock" },
                { value: "IN_STOCK", label: "In stock" },
                { value: "LOW_STOCK", label: "Low stock" },
                { value: "OUT_OF_STOCK", label: "Out of stock" },
              ]}
            />

            <FilterSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
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
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-[var(--muted)]">
                      <Loader2
                        size={28}
                        className="animate-spin text-[var(--primary)]"
                      />
                      <p className="text-xs font-medium">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : productList.length === 0 ? (
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
                        Try changing your search or filters, or add a new product.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                productList.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    menuOpen={openMenuId === product.id}
                    onToggleMenu={() =>
                      setOpenMenuId((current) =>
                        current === product.id ? null : product.id
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

        {/* Pagination Bar */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-light)] px-6 py-4 text-xs text-[var(--muted)]">
            <span>
              Showing Page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalItems} total products)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => loadProducts(pagination.currentPage - 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => loadProducts(pagination.currentPage + 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imageProduct && (
        <ImagePreviewModal
          product={imageProduct}
          onClose={() => setImageProduct(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          isDeleting={isDeleting}
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
    product.stock > 0 && product.stock <= (product.reorderLevel || 10);

  const isOutOfStock = product.stock === 0;

  const categoryName =
    typeof product.category === "object" && product.category
      ? product.category.name
      : typeof product.category === "string"
      ? product.category
      : "Unassigned";

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

            <p className="mt-1 text-xs text-[var(--muted)]">{product.uom}</p>
          </div>
        </div>
      </td>

      {/* SKU */}
      <td className="px-6 py-4 text-sm font-mono text-[var(--muted)]">
        {product.sku}
      </td>

      {/* Category */}
      <td className="px-6 py-4 text-sm text-[var(--muted)]">{categoryName}</td>

      {/* Price */}
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-[var(--foreground)]">
          ${Number(product.sellingPrice || 0).toFixed(2)}
        </p>

        <p className="mt-1 text-xs text-[var(--muted)]">
          Cost ${Number(product.costPrice || 0).toFixed(2)}
        </p>
      </td>

      {/* Stock */}
      <td className="px-6 py-4">
        <p className="text-sm font-medium">{product.stock}</p>

        {isLowStock && (
          <p className="mt-1 text-xs font-semibold text-[var(--warning)]">
            Low stock
          </p>
        )}

        {isOutOfStock && (
          <p className="mt-1 text-xs font-semibold text-[var(--danger)]">
            Out of stock
          </p>
        )}
      </td>

      {/* Platforms */}
      <td className="px-6 py-4">
        <div className="flex max-w-[180px] flex-wrap gap-1.5">
          {(!product.salesChannels || product.salesChannels.length === 0) ? (
            <span className="text-xs text-[var(--muted)]">Not listed</span>
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

          {product.salesChannels && product.salesChannels.length > 2 && (
            <span className="rounded-md bg-[var(--primary-light)] px-2 py-1 text-[11px] font-medium text-[var(--primary)]">
              +{product.salesChannels.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Tax */}
      <td className="px-6 py-4 text-sm text-[var(--muted)]">
        {Number(product.taxRate || 0).toFixed(2)}%
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

              <PermissionGate module="products" action="edit">
                <Link
                  href={`/products/edit/${product.id}`}
                  onClick={onCloseMenu}
                  className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                >
                  <Pencil size={16} />
                  Edit
                </Link>
              </PermissionGate>

              <PermissionGate module="products" action="delete">
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[var(--danger)] hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </PermissionGate>
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
  isLoading,
}: {
  label: string;
  value: number;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">
        <CountUp value={value} isLoading={isLoading} />
      </p>
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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-zinc-200 bg-zinc-100 text-zinc-600"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function TableHead({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] ${className}`}
    >
      {children}
    </th>
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
        className="form-input appearance-none !pr-9"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      />
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-xs"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              SKU: {product.sku}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[#f7faf8]">
          {product.imageUrl ? (
            <div className="relative h-full w-full">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[var(--muted)]">
              <Package size={36} />
              <p className="text-xs">No image uploaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  product,
  isDeleting,
  onClose,
  onConfirm,
}: {
  product: Product;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-xs"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Trash2 size={22} />
        </div>

        <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Delete Product
        </h3>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-[var(--foreground)]">
            &ldquo;{product.name}&rdquo;
          </span>{" "}
          (SKU: {product.sku})? This will also remove any hosted images from
          Cloudinary.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--muted-background)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting && <Loader2 size={16} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
