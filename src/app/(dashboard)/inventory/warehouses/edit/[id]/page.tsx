"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { WarehouseForm } from "@/features/warehouses/warehouse-form";
import { getWarehouseByIdApi } from "@/lib/api/warehouse.api";
import type { Warehouse } from "@/features/warehouses/warehouse.types";

export default function EditWarehousePage() {
  const params = useParams();
  const id = params?.id as string;

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    setError(null);

    getWarehouseByIdApi(id)
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setWarehouse(res.data);
        } else {
          setError(res.message || "Warehouse not found");
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err.message || "Failed to load warehouse");
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
          <p className="text-sm font-medium">Loading warehouse details...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Warehouse Not Found
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {error || "The warehouse you are trying to edit does not exist."}
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/inventory/warehouses"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-xs font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <ArrowLeft size={14} /> Back to Warehouses
          </Link>
        </div>
      </div>
    );
  }

  return <WarehouseForm mode="edit" warehouse={warehouse} />;
}
