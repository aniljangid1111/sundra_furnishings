"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Warehouse as WarehouseIcon } from "lucide-react";
import type { Warehouse, WarehouseStatus } from "./warehouse.types";

interface WarehouseFormProps {
  mode: "create" | "edit";
  warehouse?: Warehouse;
}

export function WarehouseForm({ mode, warehouse }: WarehouseFormProps) {
  const isEdit = mode === "edit";

  const [warehouseCode, setWarehouseCode] = useState(
    warehouse?.warehouseCode ?? "",
  );
  const [name, setName] = useState(warehouse?.name ?? "");
  const [address, setAddress] = useState(warehouse?.address ?? "");
  const [city, setCity] = useState(warehouse?.city ?? "");
  const [state, setState] = useState(warehouse?.state ?? "");
  const [postalCode, setPostalCode] = useState(warehouse?.postalCode ?? "");
  const [country, setCountry] = useState(
    warehouse?.country ?? "United States",
  );
  const [status, setStatus] = useState<WarehouseStatus>(
    warehouse?.status ?? "ACTIVE",
  );
  const [notes, setNotes] = useState(warehouse?.notes ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!warehouseCode.trim()) errs.warehouseCode = "Code is required.";
    if (!name.trim()) errs.name = "Warehouse name is required.";
    if (!address.trim()) errs.address = "Address is required.";
    if (!city.trim()) errs.city = "City is required.";
    if (!state.trim()) errs.state = "State is required.";
    if (!postalCode.trim()) errs.postalCode = "Postal code is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setFeedbackMessage(
      isEdit
        ? "Warehouse updated successfully. Note: Backend API persistence is pending implementation."
        : "Warehouse registered successfully. Note: Backend API persistence is pending implementation.",
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {isEdit ? "Save Changes" : "Save Warehouse"}
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {feedbackMessage}
        </div>
      )}

      <form id="warehouse-form" onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="wh-code">
                Warehouse Code *
              </label>
              <input
                id="wh-code"
                className="form-input uppercase"
                value={warehouseCode}
                onChange={(e) => setWarehouseCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                placeholder="e.g. WH-04"
                required
              />
              {errors.warehouseCode && (
                <p className="mt-1 text-xs text-[var(--danger)]">{errors.warehouseCode}</p>
              )}
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
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[var(--danger)]">{errors.name}</p>
              )}
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
              />
              {errors.address && (
                <p className="mt-1 text-xs text-[var(--danger)]">{errors.address}</p>
              )}
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
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
          >
            {isEdit ? "Save Changes" : "Save Warehouse"}
          </button>
        </div>
      </form>
    </div>
  );
}
