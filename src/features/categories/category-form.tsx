"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Save,
  Tag,
} from "lucide-react";

import type { Category } from "./category.types";

interface CategoryFormProps {
  mode: "create" | "edit";
  category?: Category;
}

export function CategoryForm({
  mode,
  category,
}: CategoryFormProps) {
  const isEdit = mode === "edit";

  const [name, setName] = useState(category?.name ?? "");
  const [code, setCode] = useState(category?.code ?? "");
  const [description, setDescription] = useState(
    category?.description ?? "",
  );
  const [status, setStatus] = useState<
    "ACTIVE" | "INACTIVE"
  >(category?.status ?? "ACTIVE");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = {
      name,
      code,
      description,
      status,
    };

    console.log(
      isEdit ? "Update category:" : "Create category:",
      formData,
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
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
                className="min-h-[120px] w-full resize-y rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe this category..."
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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />

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