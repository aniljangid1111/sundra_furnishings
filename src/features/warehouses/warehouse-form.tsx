"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import type { Warehouse, WarehouseStatus } from "./warehouse.types";
import { createWarehouseApi, updateWarehouseApi } from "@/lib/api/warehouse.api";

interface WarehouseFormProps {
  mode: "create" | "edit";
  warehouse?: Warehouse;
}

export function WarehouseForm({ mode, warehouse }: WarehouseFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [warehouseCode, setWarehouseCode] = useState(
    warehouse?.warehouseCode ?? ""
  );
  const [name, setName] = useState(warehouse?.name ?? "");
  const [address, setAddress] = useState(warehouse?.address ?? "");
  const [city, setCity] = useState(warehouse?.city ?? "");
  const [state, setState] = useState(warehouse?.state ?? "");
  const [postalCode, setPostalCode] = useState(warehouse?.postalCode ?? "");
  const [country, setCountry] = useState(
    warehouse?.country ?? "United States"
  );
  const [status, setStatus] = useState<WarehouseStatus>(
    warehouse?.status ?? "ACTIVE"
  );
  const [notes, setNotes] = useState(warehouse?.notes ?? "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      warehouseCode: warehouseCode.trim().toUpperCase(),
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      status,
      notes: notes.trim(),
    };

    try {
      if (isEdit && warehouse?.id) {
        await updateWarehouseApi(warehouse.id, payload);
      } else {
        await createWarehouseApi(payload);
      }

      router.push("/inventory/warehouses");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to save warehouse. Please check your inputs."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/inventory/warehouses"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-[var(--muted-background)]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Warehouse" : "Add Warehouse"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Configure inventory holding hub, cross-dock, or showroom storage space.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/inventory/warehouses"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="warehouse-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white! hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Warehouse"}
          </button>
        </div>
      </div>

      <form id="warehouse-form" onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-code">
                Warehouse Code *
              </label>
              <input
                id="wh-code"
                className="form-input uppercase font-mono"
                value={warehouseCode}
                onChange={(e) =>
                  setWarehouseCode(e.target.value.toUpperCase().replace(/\s/g, ""))
                }
                placeholder="e.g. WH-04"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-name">
                Warehouse Name *
              </label>
              <input
                id="wh-name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. South Regional Hub"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-address">
                Street Address *
              </label>
              <input
                id="wh-address"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Industrial park or street address"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-city">
                City *
              </label>
              <input
                id="wh-city"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-state">
                  State *
                </label>
                <input
                  id="wh-state"
                  className="form-input uppercase"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-zip">
                  Postal Code *
                </label>
                <input
                  id="wh-zip"
                  className="form-input"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="ZIP"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-country">
                Country *
              </label>
              <input
                id="wh-country"
                className="form-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-status">
                Status *
              </label>
              <select
                id="wh-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as WarehouseStatus)}
                disabled={isSubmitting}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-notes">
                Operational Notes
              </label>
              <textarea
                id="wh-notes"
                className="min-h-[80px] w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--primary)]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dock clearance heights, staging bay numbers, security codes..."
                disabled={isSubmitting}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Link
            href="/inventory/warehouses"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white! hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Warehouse"}
          </button>
        </div>
      </form>
    </div>
  );
}
