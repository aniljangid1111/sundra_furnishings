"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Save,
  Tag,
} from "lucide-react";

import {
  createCategoryApi,
  updateCategoryApi,
} from "@/lib/api/category.api";
import type { Category } from "./category.types";

interface CategoryFormProps {
  mode: "create" | "edit";
  category?: Category;
}

export function CategoryForm({
  mode,
  category,
}: CategoryFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState(category?.name ?? "");
  const [code, setCode] = useState(category?.code ?? "");
  const [description, setDescription] = useState(
    category?.description ?? "",
  );
  const [status, setStatus] = useState<
    "ACTIVE" | "INACTIVE"
  >(category?.status ?? "ACTIVE");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEdit && category?.id) {
        await updateCategoryApi(category.id, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          status,
        });
      } else {
        await createCategoryApi({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          status,
        });
      }

      router.push("/categories");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to save category. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

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
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Category" : "Add Category"}
            </h1>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {isEdit
                ? "Update category information."
                : "Create a new product category."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/categories"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium transition hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="category-form"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Category"}
          </button>
        </div>
      </div>

      <form
        id="category-form"
        onSubmit={handleSubmit}
      >
        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-5 py-4">
            <div className="mt-0.5 text-[var(--primary)]">
              <Tag size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Category Information
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Maintain the master information used for product
                categorization.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <FormField
              label="Category Name"
              required
            >
              <input
                className="form-input"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Furniture"
                required
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Category Code"
              required
            >
              <input
                className="form-input uppercase"
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/\s/g, ""),
                  )
                }
                placeholder="e.g. FUR"
                maxLength={20}
                required
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Status"
              required
            >
              <select
                className="form-input"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "ACTIVE"
                      | "INACTIVE",
                  )
                }
                disabled={isSubmitting}
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </FormField>

            <div />

            <FormField
              label="Description"
              className="md:col-span-2"
            >
              <textarea
                className="min-h-[120px] w-full resize-y rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] disabled:opacity-50"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe this category..."
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-end gap-2 rounded-xl border border-[var(--border)] bg-white p-4">
          <Link
            href="/categories"
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

            {isEdit
              ? "Save Changes"
              : "Save Category"}
          </button>
        </div>
      </form>
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

        {required && (
          <span className="ml-1 text-[var(--danger)]">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}
