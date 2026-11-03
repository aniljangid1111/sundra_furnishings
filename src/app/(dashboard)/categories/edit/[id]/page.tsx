"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { CategoryForm } from "@/features/categories/category-form";
import { getCategoryByIdApi } from "@/lib/api/category.api";
import type { Category } from "@/features/categories/category.types";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
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
          {error || "The category you are trying to edit does not exist or has been removed."}
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

  return <CategoryForm mode="edit" category={category} />;
}
