"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import type {
  SalesChannel,
  SalesChannelStatus,
  SalesChannelType,
} from "./sales-channel.types";
import {
  createSalesChannelApi,
  updateSalesChannelApi,
} from "@/lib/api/salesChannel.api";

interface SalesChannelFormProps {
  mode: "create" | "edit";
  channel?: SalesChannel;
}

export function SalesChannelForm({
  mode,
  channel,
}: SalesChannelFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState(channel?.name ?? "");
  const [code, setCode] = useState(channel?.code ?? "");
  const [type, setType] = useState<SalesChannelType>(
    channel?.type ?? "MARKETPLACE",
  );
  const [website, setWebsite] = useState(channel?.website ?? "");
  const [description, setDescription] = useState(
    channel?.description ?? "",
  );
  const [status, setStatus] = useState<SalesChannelStatus>(
    channel?.status ?? "ACTIVE",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      website: website.trim() || undefined,
      description: description.trim() || undefined,
      status,
    };

    try {
      if (isEdit && channel?.id) {
        await updateSalesChannelApi(channel.id, payload);
      } else {
        await createSalesChannelApi(payload);
      }

      router.push("/sales-channels");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to save sales channel. Please check your inputs.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)] disabled:opacity-50";

  const labelClass = "text-sm font-medium text-[var(--foreground)]";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/sales-channels"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--muted-background)]"
            aria-label="Back to sales channels"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold">
              {isEdit ? "Edit Sales Channel" : "Add Sales Channel"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Manage the platforms, marketplaces, and stores where products are sold.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/sales-channels"
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="sales-channel-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white! hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Channel"}
          </button>
        </div>
      </div>

      <form
        id="sales-channel-form"
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7 shadow-xs"
      >
        <div>
          <h2 className="text-base font-semibold">Channel Information</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Enter the basic configuration for this sales channel.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="channel-name">
              Channel Name *
            </label>
            <input
              id="channel-name"
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Amazon"
              required
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="channel-code">
              Channel Code *
            </label>
            <input
              id="channel-code"
              className={`${inputClass} uppercase font-mono`}
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9-]/g, ""),
                )
              }
              placeholder="e.g. AMZ"
              required
              maxLength={20}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="channel-type">
              Channel Type *
            </label>
            <select
              id="channel-type"
              className={inputClass}
              value={type}
              onChange={(event) =>
                setType(event.target.value as SalesChannelType)
              }
              disabled={isSubmitting}
            >
              <option value="MARKETPLACE">Marketplace</option>
              <option value="OWN_WEBSITE">Own Website</option>
              <option value="RETAIL">Retail Store</option>
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="channel-status">
              Status *
            </label>
            <select
              id="channel-status"
              className={inputClass}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as SalesChannelStatus)
              }
              disabled={isSubmitting}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="channel-website">
              Website URL
            </label>
            <input
              id="channel-website"
              type="url"
              className={inputClass}
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="channel-description">
              Description
            </label>
            <textarea
              id="channel-description"
              className="mt-1.5 min-h-28 w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--primary)] disabled:opacity-50"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe how this sales channel is used..."
              maxLength={500}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--border-light)] pt-5">
          <Link
            href="/sales-channels"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white! hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? "Save Changes" : "Save Channel"}
          </button>
        </div>
      </form>
    </div>
  );
}
