"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  ExternalLink,
  Eye,
  Loader2,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Store,
  Trash2,
} from "lucide-react";

import type {
  SalesChannel,
  SalesChannelStatus,
} from "@/features/sales-channels/sales-channel.types";
import {
  getSalesChannelsApi,
  updateSalesChannelApi,
  deleteSalesChannelApi,
  type SalesChannelKpi,
} from "@/lib/api/salesChannel.api";
import { CountUp } from "@/components/ui/count-up";
import { PermissionGate } from "@/lib/auth/permissions";

export default function SalesChannelsPage() {
  const [channelList, setChannelList] = useState<SalesChannel[]>([]);
  const [kpi, setKpi] = useState<SalesChannelKpi>({
    totalChannels: 0,
    activeChannels: 0,
    inactiveChannels: 0,
    marketplaceCount: 0,
    retailCount: 0,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<SalesChannel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadChannels = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await getSalesChannelsApi({
          page: pageToLoad,
          limit: 10,
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          type: typeFilter !== "ALL" ? typeFilter : undefined,
        });

        if (res.success) {
          setChannelList(res.data || []);
          if (res.kpi) {
            setKpi(res.kpi as SalesChannelKpi);
          }
          if (res.pagination) {
            setPagination({
              currentPage: res.pagination.currentPage,
              totalPages: res.pagination.totalPages,
              totalItems: res.pagination.totalItems,
              hasNextPage: res.pagination.hasNextPage,
              hasPrevPage: res.pagination.hasPrevPage,
            });
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load sales channels from server.");
      } finally {
        setIsLoading(false);
      }
    },
    [search, statusFilter, typeFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadChannels(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [loadChannels]);

  const toggleStatus = async (channel: SalesChannel) => {
    const newStatus: SalesChannelStatus =
      channel.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setOpenMenuId(null);

    try {
      await updateSalesChannelApi(channel.id, { status: newStatus });
      setActionNotice(
        `Channel status updated to ${newStatus === "ACTIVE" ? "Active" : "Inactive"}.`
      );
      loadChannels(pagination.currentPage);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteSalesChannelApi(deleteTarget.id);
      setDeleteTarget(null);
      setOpenMenuId(null);
      loadChannels(pagination.currentPage);
    } catch (err: any) {
      alert(err.message || "Failed to delete sales channel");
    } finally {
      setIsDeleting(false);
    }
  };

  function typeLabel(type: string) {
    switch (type) {
      case "OWN_WEBSITE":
        return "Own Website";
      case "MARKETPLACE":
        return "Marketplace";
      case "RETAIL":
        return "Retail Store";
      default:
        return type;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Sales Channels</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your digital marketplaces, retail stores, and direct e-commerce portals.
          </p>
        </div>

        <PermissionGate module="salesChannels" action="create">
          <Link
            href="/sales-channels/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white! hover:bg-[var(--primary-dark)] shadow-sm"
          >
            <Plus size={18} />
            Add Channel
          </Link>
        </PermissionGate>
      </div>

      {actionNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {actionNotice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <p className="flex-1 font-medium">{error}</p>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">Total Channels</p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Store size={19} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold">
            <CountUp value={kpi.totalChannels} isLoading={isLoading} />
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">Active Channels</p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={19} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold">
            <CountUp value={kpi.activeChannels} isLoading={isLoading} />
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">Inactive Channels</p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CircleOff size={19} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold">
            <CountUp value={kpi.inactiveChannels} isLoading={isLoading} />
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">Marketplaces</p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Package size={19} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold">
            <CountUp value={kpi.marketplaceCount} isLoading={isLoading} />
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-visible rounded-2xl border border-[var(--border)] bg-white shadow-xs">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search channel name, code, or description..."
              className="form-input !pl-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[140px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-input appearance-none pr-8 text-sm"
              >
                <option value="ALL">All Types</option>
                <option value="MARKETPLACE">Marketplace</option>
                <option value="OWN_WEBSITE">Own Website</option>
                <option value="RETAIL">Retail Store</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>

            <div className="relative min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input appearance-none pr-8 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[#fafcfb] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Website</th>
                <th className="px-6 py-4">Listings</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-[var(--muted)]">
                      <Loader2 size={28} className="animate-spin text-[var(--primary)]" />
                      <p className="text-xs font-medium">Loading sales channels...</p>
                    </div>
                  </td>
                </tr>
              ) : channelList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted-background)] text-[var(--muted)]">
                        <Store size={22} />
                      </div>
                      <p className="mt-4 text-sm font-medium">No sales channels found</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Try adjusting your search query or filter settings.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                channelList.map((channel) => {
                  const isMenuOpen = openMenuId === channel.id;
                  const isActive = channel.status === "ACTIVE";

                  return (
                    <tr
                      key={channel.id}
                      className="transition-colors hover:bg-[var(--muted-background)]/50"
                    >
                      <td className="px-6 py-4 font-medium">
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">
                            {channel.name}
                          </p>
                          {channel.description && (
                            <p className="text-xs text-[var(--muted)] line-clamp-1">
                              {channel.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-[var(--muted)] font-medium">
                        {channel.code}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium">
                        {typeLabel(channel.type)}
                      </td>

                      <td className="px-6 py-4 text-xs text-[var(--muted)]">
                        {channel.website ? (
                          <a
                            href={channel.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                          >
                            Visit <ExternalLink size={12} />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        {channel.productCount ?? 0} products
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isActive
                              ? "bg-emerald-50 text-[var(--success)]"
                              : "bg-gray-100 text-[var(--muted)]"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="relative px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(isMenuOpen ? null : channel.id)
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
                          aria-label={`Actions for ${channel.name}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setOpenMenuId(null)}
                            />

                            <div className="absolute right-6 top-12 z-40 w-44 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg">
                              <Link
                                href={`/sales-channels/view/${channel.id}`}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Eye size={14} /> View Details
                              </Link>

                              <PermissionGate module="salesChannels" action="edit">
                                <Link
                                  href={`/sales-channels/edit/${channel.id}`}
                                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <Pencil size={14} /> Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => toggleStatus(channel)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-background)]"
                                >
                                  {isActive ? (
                                    <>
                                      <CircleOff size={14} /> Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={14} /> Activate
                                    </>
                                  )}
                                </button>
                              </PermissionGate>

                              <PermissionGate module="salesChannels" action="delete">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteTarget(channel);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </PermissionGate>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-light)] px-6 py-4 text-xs text-[var(--muted)]">
            <span>
              Showing Page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalItems} total channels)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => loadChannels(pagination.currentPage - 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => loadChannels(pagination.currentPage + 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)] disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Delete Sales Channel
            </h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {deleteTarget.name}
              </span>{" "}
              ({deleteTarget.code})?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted-background)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
