"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Package,
  Pencil,
  Store,
  XCircle,
} from "lucide-react";

import { getSalesChannelByIdApi } from "@/lib/api/salesChannel.api";
import { PermissionGate } from "@/lib/auth/permissions";
import type { SalesChannel } from "@/features/sales-channels/sales-channel.types";

export default function ViewSalesChannelPage() {
  const params = useParams();
  const id = params?.id as string;

  const [channel, setChannel] = useState<SalesChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    setError(null);

    getSalesChannelByIdApi(id)
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setChannel(res.data);
        } else {
          setError(res.message || "Sales channel not found");
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err.message || "Failed to load channel details");
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
          <p className="text-sm font-medium">Loading sales channel...</p>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Sales Channel Not Found
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {error || "The sales channel you are looking for does not exist."}
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/sales-channels"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-xs font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            <ArrowLeft size={14} /> Back to Sales Channels
          </Link>
        </div>
      </div>
    );
  }

  const typeLabel = {
    MARKETPLACE: "Marketplace",
    OWN_WEBSITE: "Own Website",
    RETAIL: "Retail Store",
  }[channel.type];

  const isActive = channel.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/sales-channels"
            aria-label="Back to sales channels"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--muted-background)]"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold">{channel.name}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Sales channel details and linked listings summary.
            </p>
          </div>
        </div>

        <PermissionGate module="salesChannels" action="edit">
          <Link
            href={`/sales-channels/edit/${channel.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! hover:bg-[var(--primary-dark)]"
          >
            <Pencil size={16} />
            Edit Channel
          </Link>
        </PermissionGate>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
            <Store size={26} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold">{channel.name}</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Channel code: <span className="font-mono font-medium text-[var(--foreground)]">{channel.code}</span>
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isActive ? (
              <CheckCircle2 size={13} className="text-emerald-500" />
            ) : (
              <XCircle size={13} className="text-zinc-400" />
            )}
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-6 lg:col-span-2 shadow-xs">
          <h2 className="font-semibold">Channel Information</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[var(--muted)]">Channel Name</p>
              <p className="mt-1 font-medium">{channel.name}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Channel Code</p>
              <p className="mt-1 font-medium font-mono">{channel.code}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Channel Type</p>
              <p className="mt-1 font-medium">{typeLabel}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Status</p>
              <p className="mt-1 font-medium">
                {isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-[var(--muted)]">Website URL</p>
              {channel.website ? (
                <a
                  href={channel.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-2 break-all font-medium text-[var(--primary)] hover:underline"
                >
                  {channel.website}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <p className="mt-1 text-[var(--muted)]">Not provided</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-[var(--muted)]">Description</p>
              <p className="mt-1 leading-6">
                {channel.description || "No description provided."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs">
          <h2 className="font-semibold">Channel Summary</h2>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[var(--muted-background)] p-4">
            <Package size={22} className="text-[var(--primary)]" />
            <div>
              <p className="text-sm text-[var(--muted)]">Product Listings</p>
              <p className="mt-1 text-2xl font-semibold">
                {channel.productCount ?? 0}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
            Total active catalogue items configured for sale on this channel.
          </p>

          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            View Products Catalog
            <ExternalLink size={14} />
          </Link>
        </section>
      </div>

      <div>
        <Link
          href="/sales-channels"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Back to Sales Channels
        </Link>
      </div>
    </div>
  );
}
