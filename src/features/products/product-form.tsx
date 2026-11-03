"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import type { Product } from "./product.types";
import type { Category } from "@/features/categories/category.types";
import { createProductApi, updateProductApi } from "@/lib/api/product.api";
import { getCategoriesApi } from "@/lib/api/category.api";

type PlatformMapping = {
  id: string;
  platform: string;
  sku: string;
  sellingPrice: string;
  status: "ACTIVE" | "INACTIVE";
};

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
}

const salesChannels = ["Website", "Amazon", "Wayfair"];

const units = ["PCS", "SET", "BOX", "PAIR", "KG"];

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Categories from Backend
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Initial categoryId
  const initialCategoryId =
    product?.categoryId ??
    (typeof product?.category === "object" && product.category
      ? product.category.id
      : undefined);

  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    initialCategoryId ? String(initialCategoryId) : ""
  );
  const [uom, setUom] = useState(product?.uom ?? "PCS");
  const [costPrice, setCostPrice] = useState(
    product?.costPrice?.toString() ?? ""
  );
  const [sellingPrice, setSellingPrice] = useState(
    product?.sellingPrice?.toString() ?? ""
  );
  const [taxRate, setTaxRate] = useState(
    product?.taxRate?.toString() ?? "8.25"
  );
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [reorderLevel, setReorderLevel] = useState(
    product?.reorderLevel?.toString() ?? "10"
  );
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
    product?.status ?? "ACTIVE"
  );

  // Image upload
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Platform Mappings
  const [platformMappings, setPlatformMappings] = useState<PlatformMapping[]>(
    product?.salesChannels?.length
      ? product.salesChannels.map((platform, index) => ({
          id: `platform-${index}`,
          platform,
          sku: product.sku,
          sellingPrice: product.sellingPrice.toString(),
          status: "ACTIVE",
        }))
      : [
          {
            id: "platform-0",
            platform: "Website",
            sku: product?.sku ?? "",
            sellingPrice: product?.sellingPrice?.toString() ?? "",
            status: "ACTIVE",
          },
        ]
  );

  // Load real categories from API
  useEffect(() => {
    getCategoriesApi({ limit: "all" })
      .then((res) => {
        if (res.success && res.data) {
          setCategoriesList(res.data);
          // If editing and category name matches an item, set categoryId
          if (!categoryId && product?.category) {
            const found = res.data.find(
              (c) =>
                c.name === product.category ||
                (typeof product.category === "object" &&
                  c.id === product.category?.id)
            );
            if (found) setCategoryId(String(found.id));
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch categories list", err);
      });
  }, [categoryId, product]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImageUrl("");
  };

  const addPlatform = () => {
    const usedPlatforms = new Set(
      platformMappings.map((item) => item.platform)
    );

    const nextPlatform = salesChannels.find(
      (platform) => !usedPlatforms.has(platform)
    );

    if (!nextPlatform) return;

    setPlatformMappings((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        platform: nextPlatform,
        sku,
        sellingPrice,
        status: "ACTIVE",
      },
    ]);
  };

  const updatePlatform = (
    id: string,
    field: keyof PlatformMapping,
    value: string
  ) => {
    setPlatformMappings((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removePlatform = (id: string) => {
    setPlatformMappings((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const channelList = platformMappings.map((m) => m.platform);

    try {
      if (selectedFile) {
        // Send multipart form data with image file
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("sku", sku.trim().toUpperCase());
        if (categoryId) formData.append("categoryId", categoryId);
        formData.append("uom", uom);
        formData.append("costPrice", costPrice || "0");
        formData.append("sellingPrice", sellingPrice || "0");
        formData.append("taxRate", taxRate || "0");
        formData.append("stock", stock || "0");
        formData.append("reorderLevel", reorderLevel || "10");
        formData.append("status", status);
        formData.append("salesChannels", JSON.stringify(channelList));
        formData.append("image", selectedFile);

        if (isEdit && product?.id) {
          await updateProductApi(product.id, formData);
        } else {
          await createProductApi(formData);
        }
      } else {
        // Send standard JSON payload
        const payload = {
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          categoryId: categoryId ? Number(categoryId) : null,
          uom,
          costPrice: Number(costPrice || 0),
          sellingPrice: Number(sellingPrice || 0),
          taxRate: Number(taxRate || 0),
          stock: Number(stock || 0),
          reorderLevel: Number(reorderLevel || 10),
          status,
          imageUrl: imageUrl || null,
          salesChannels: channelList,
        };

        if (isEdit && product?.id) {
          await updateProductApi(product.id, payload);
        } else {
          await createProductApi(payload);
        }
      }

      router.push("/products");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to save product. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePlatformCount = salesChannels.length - platformMappings.length;

  const currentCategoryName =
    categoriesList.find((c) => String(c.id) === categoryId)?.name ||
    (typeof product?.category === "object" && product?.category
      ? product.category.name
      : typeof product?.category === "string"
      ? product.category
      : "");

  return (
    <div className="mx-auto max-w-7xl">
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/products"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
            aria-label="Back to products"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Product" : "Add Product"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isEdit
                ? "Update product information and sales channel mappings."
                : "Create a new product in your product master."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Product"}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="rounded-xl border border-[var(--border)] bg-white">
              <SectionHeader
                icon={<Package size={18} />}
                title="Basic Information"
                description="Core information used across inventory, purchases, sales and reports."
              />

              <div className="grid gap-5 p-5 md:grid-cols-2">
                <FormField
                  label="Product Name"
                  required
                  className="md:col-span-2"
                >
                  <input
                    className="form-input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Luna Accent Chair"
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="SKU" required>
                  <input
                    className="form-input font-mono uppercase"
                    value={sku}
                    onChange={(event) =>
                      setSku(
                        event.target.value.toUpperCase().replace(/\s/g, "")
                      )
                    }
                    placeholder="e.g. CHR-001"
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Category">
                  <select
                    className="form-input"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select a category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Unit of Measure" required>
                  <SelectInput
                    value={uom}
                    onChange={setUom}
                    options={units}
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Status">
                  <SelectInput
                    value={status}
                    onChange={(value) =>
                      setStatus(value as "ACTIVE" | "INACTIVE")
                    }
                    options={["ACTIVE", "INACTIVE"]}
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-white">
              <SectionHeader
                title="Pricing & Tax"
                description="Define the standard cost, selling price and tax rate."
              />

              <div className="grid gap-5 p-5 md:grid-cols-3">
                <FormField label="Cost Price" required>
                  <InputWithPrefix
                    prefix="$"
                    value={costPrice}
                    onChange={setCostPrice}
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Selling Price" required>
                  <InputWithPrefix
                    prefix="$"
                    value={sellingPrice}
                    onChange={setSellingPrice}
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Tax Rate (%)" required>
                  <InputWithSuffix
                    suffix="%"
                    value={taxRate}
                    onChange={setTaxRate}
                    placeholder="8.25"
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-white">
              <SectionHeader
                title="Inventory"
                description="Initial stock and replenishment settings for this product."
              />

              <div className="grid gap-5 p-5 md:grid-cols-2">
                <FormField label="Current Stock" required>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    placeholder="0"
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Reorder Level" required>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={reorderLevel}
                    onChange={(event) => setReorderLevel(event.target.value)}
                    placeholder="10"
                    required
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-white">
              <SectionHeader
                title="Sales Channels"
                description="Map this product to the platforms where it is sold."
                action={
                  availablePlatformCount > 0 ? (
                    <button
                      type="button"
                      onClick={addPlatform}
                      disabled={isSubmitting}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-50"
                    >
                      <Plus size={15} />
                      Add Platform
                    </button>
                  ) : null
                }
              />

              <div className="p-5">
                {platformMappings.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
                    <p className="text-sm font-medium">
                      No sales channels mapped
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Add a platform to define channel-specific SKU and pricing.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Platform
                          </th>
                          <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Platform SKU
                          </th>
                          <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Selling Price
                          </th>
                          <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Status
                          </th>
                          <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {platformMappings.map((mapping) => (
                          <tr
                            key={mapping.id}
                            className="border-b border-[var(--border-light)] last:border-b-0"
                          >
                            <td className="py-3 pr-4">
                              <select
                                className="form-input"
                                value={mapping.platform}
                                onChange={(event) =>
                                  updatePlatform(
                                    mapping.id,
                                    "platform",
                                    event.target.value
                                  )
                                }
                                disabled={isSubmitting}
                              >
                                {salesChannels.map((platform) => {
                                  const usedByOtherRow =
                                    platformMappings.some(
                                      (item) =>
                                        item.id !== mapping.id &&
                                        item.platform === platform
                                    );

                                  return (
                                    <option
                                      key={platform}
                                      value={platform}
                                      disabled={usedByOtherRow}
                                    >
                                      {platform}
                                    </option>
                                  );
                                })}
                              </select>
                            </td>

                            <td className="py-3 pr-4">
                              <input
                                className="form-input uppercase"
                                value={mapping.sku}
                                onChange={(event) =>
                                  updatePlatform(
                                    mapping.id,
                                    "sku",
                                    event.target.value
                                  )
                                }
                                placeholder="Platform SKU"
                                disabled={isSubmitting}
                              />
                            </td>

                            <td className="py-3 pr-4">
                              <InputWithPrefix
                                prefix="$"
                                value={mapping.sellingPrice}
                                onChange={(value) =>
                                  updatePlatform(
                                    mapping.id,
                                    "sellingPrice",
                                    value
                                  )
                                }
                                placeholder="0.00"
                                disabled={isSubmitting}
                              />
                            </td>

                            <td className="py-3 pr-4">
                              <select
                                className="form-input"
                                value={mapping.status}
                                onChange={(event) =>
                                  updatePlatform(
                                    mapping.id,
                                    "status",
                                    event.target.value
                                  )
                                }
                                disabled={isSubmitting}
                              >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                              </select>
                            </td>

                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => removePlatform(mapping.id)}
                                disabled={
                                  platformMappings.length === 1 || isSubmitting
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--danger)] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={`Remove ${mapping.platform}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {availablePlatformCount === 0 && (
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    All available sales channels are already mapped.
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-xl border border-[var(--border)] bg-white">
              <SectionHeader
                title="Product Image"
                description="Upload an image to Cloudinary for catalog identification."
              />

              <div className="p-5">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted-background)]">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={name || "Product preview"}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[var(--muted)] shadow-sm transition hover:text-[var(--danger)]"
                        aria-label="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <label className="flex h-full cursor-pointer flex-col items-center justify-center p-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm">
                        <ImagePlus size={22} />
                      </div>

                      <p className="text-sm font-medium">Upload product image</p>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        PNG, JPG, WEBP (Max 5MB)
                      </p>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-white">
              <SectionHeader title="Product Summary" />

              <div className="divide-y divide-[var(--border-light)] px-5">
                <SummaryRow label="Product" value={name || "—"} />

                <SummaryRow label="SKU" value={sku || "—"} />

                <SummaryRow
                  label="Category"
                  value={currentCategoryName || "Unassigned"}
                />

                <SummaryRow
                  label="Selling Price"
                  value={
                    sellingPrice ? `$${Number(sellingPrice).toFixed(2)}` : "—"
                  }
                />

                <SummaryRow label="Stock" value={stock || "0"} />

                <SummaryRow
                  label="Platforms"
                  value={String(platformMappings.length)}
                />
              </div>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 rounded-xl border border-[var(--border)] bg-white p-4">
          <Link
            href="/products"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
      <div className="flex items-start gap-2.5">
        {icon && <div className="mt-0.5 text-[var(--primary)]">{icon}</div>}

        <div>
          <h2 className="text-sm font-semibold">{title}</h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-[var(--danger)]">*</span>}
      </label>

      {children}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <select
      className="form-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
    >
      {placeholder && <option value="">{placeholder}</option>}

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function InputWithPrefix({
  prefix,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  prefix: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
        {prefix}
      </span>

      <input
        className="form-input pl-7"
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

function InputWithSuffix({
  suffix,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <input
        className="form-input pr-8"
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
        {suffix}
      </span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>

      <span className="max-w-[60%] truncate text-right text-sm font-medium">
        {value}
      </span>
    </div>
  );
}
