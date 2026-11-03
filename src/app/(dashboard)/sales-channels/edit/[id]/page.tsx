"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { SalesChannelForm } from "@/features/sales-channels/sales-channel-form";
import { getSalesChannelByIdApi } from "@/lib/api/salesChannel.api";
import type { SalesChannel } from "@/features/sales-channels/sales-channel.types";

export default function EditSalesChannelPage() {
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
          {error || "The sales channel you are trying to edit does not exist."}
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

  return <SalesChannelForm mode="edit" channel={channel} />;
}
