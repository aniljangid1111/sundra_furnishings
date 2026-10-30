
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Package,
  Pencil,
  Store,
} from "lucide-react";
import { salesChannels } from "@/features/sales-channels/sales-channel.data";

interface ViewSalesChannelPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewSalesChannelPage({
  params,
}: ViewSalesChannelPageProps) {
  const { id } = await params;

  const channel = salesChannels.find((item) => item.id === Number(id));

  if (!channel) {
    notFound();
  }

  const typeLabel = {
    MARKETPLACE: "Marketplace",
    OWN_WEBSITE: "Own Website",
    RETAIL: "Retail Store",
  }[channel.type];

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
              Sales channel details
            </p>
          </div>
        </div>

        <Link
          href={`/sales-channels/edit/${channel.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! hover:bg-[var(--primary-dark)]"
        >
          <Pencil size={16} />
          Edit Channel
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
            <Store size={26} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold">{channel.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Channel code: {channel.code}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
              channel.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {channel.status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold">Channel Information</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[var(--muted)]">Channel Name</p>
              <p className="mt-1 font-medium">{channel.name}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Channel Code</p>
              <p className="mt-1 font-medium">{channel.code}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Channel Type</p>
              <p className="mt-1 font-medium">{typeLabel}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Status</p>
              <p className="mt-1 font-medium">
                {channel.status === "ACTIVE" ? "Active" : "Inactive"}
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
                <p className="mt-1">Not provided</p>
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

        <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">Channel Summary</h2>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[var(--muted-background)] p-4">
            <Package size={22} className="text-[var(--primary)]" />
            <div>
              <p className="text-sm text-[var(--muted)]">Product Listings</p>
              <p className="mt-1 text-2xl font-semibold">
                {channel.productCount}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            This is the number of sample product listings associated with this
            channel. Live linked counts will come from the database later.
          </p>

          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            View Products
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
