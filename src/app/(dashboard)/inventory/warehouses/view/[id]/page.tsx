"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Pencil,
  Warehouse as WarehouseIcon,
  XCircle,
} from "lucide-react";

import { getWarehouseByIdApi } from "@/lib/api/warehouse.api";
import { PermissionGate } from "@/lib/auth/permissions";
import type { Warehouse } from "@/features/warehouses/warehouse.types";

export default function ViewWarehousePage() {
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
        setError(err.message || "Failed to load warehouse details");
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
          {error || "The warehouse you are looking for does not exist."}
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

  const isActive = warehouse.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            href="/inventory/warehouses"
            aria-label="Back to warehouses"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {warehouse.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isActive
                    ? "bg-emerald-50 text-[var(--success)]"
                    : "bg-gray-100 text-[var(--muted)]"
                }`}
              >
                {isActive ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                  <XCircle size={12} className="text-zinc-400" />
                )}
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Warehouse Code:{" "}
              <span className="font-mono font-medium text-[var(--foreground)]">
                {warehouse.warehouseCode}
              </span>
            </p>
          </div>
        </div>

        <PermissionGate module="warehouses" action="edit">
          <Link
            href={`/inventory/warehouses/edit/${warehouse.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! transition hover:bg-[var(--primary-dark)]"
          >
            <Pencil size={16} />
            Edit Warehouse
          </Link>
        </PermissionGate>
      </div>

      {/* Facility overview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Facility Address
          </p>
          <div className="mt-2 flex items-start gap-2 text-sm text-[var(--foreground)]">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" />
            <p>
              {warehouse.address}, {warehouse.city}, {warehouse.state}{" "}
              {warehouse.postalCode}, {warehouse.country}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Facility Status
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
            {isActive ? "Operational & Accepting Inventory" : "Inactive"}
          </p>
        </div>
      </div>

      {/* Operational Notes */}
      {warehouse.notes && (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="font-semibold text-sm">Operational Notes</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            {warehouse.notes}
          </p>
        </section>
      )}

      <div>
        <Link
          href="/inventory/warehouses"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Back to Warehouses
        </Link>
      </div>
    </div>
  );
}
