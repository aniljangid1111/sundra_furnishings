
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import type {
  SalesChannel,
  SalesChannelStatus,
  SalesChannelType,
} from "./sales-channel.types";

interface SalesChannelFormProps {
  mode: "create" | "edit";
  channel?: SalesChannel;
}

export function SalesChannelForm({
  mode,
  channel,
}: SalesChannelFormProps) {
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
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // UI-only: API integration will be added later.
    setMessage(
      mode === "create"
        ? "Sales channel form validated. API integration is pending."
        : "Changes validated. API integration is pending.",
    );
  }

  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]";

  const labelClass = "text-sm font-medium text-[var(--foreground)]";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
            {mode === "create" ? "Add Sales Channel" : "Edit Sales Channel"}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage the platform where your products are sold.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7"
      >
        <div>
          <h2 className="text-base font-semibold">Channel Information</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Enter the basic details of this sales channel.
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
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="channel-code">
              Channel Code *
            </label>
            <input
              id="channel-code"
              className={inputClass}
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
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="channel-description">
              Description
            </label>
            <textarea
              id="channel-description"
              className="mt-1.5 min-h-28 w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--primary)]"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe how this sales channel is used..."
              maxLength={500}
            />
          </div>
        </div>

        {message && (
          <p
            role="status"
            className="rounded-xl bg-[var(--primary-light)] p-3 text-sm text-[var(--primary)]"
          >
            {message}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--border-light)] pt-5">
          <Link
            href="/sales-channels"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--muted-background)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
          >
            <Save size={16} />
            {mode === "create" ? "Save Channel" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
