
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    Store,
    CheckCircle2,
    CircleOff,
    Package,
    MoreHorizontal,
    Eye,
    Pencil,
    ExternalLink,
} from "lucide-react";
import { salesChannels } from "@/features/sales-channels/sales-channel.data";
import type { SalesChannelStatus } from "@/features/sales-channels/sales-channel.types";

export default function SalesChannelsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [channels, setChannels] = useState(salesChannels);

    const filteredChannels = useMemo(() => {
        const query = search.trim().toLowerCase();

        return channels.filter((channel) => {
            const matchesSearch =
                channel.name.toLowerCase().includes(query) ||
                channel.code.toLowerCase().includes(query) ||
                channel.type.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" || channel.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [channels, search, statusFilter]);

    const activeCount = channels.filter(
        (channel) => channel.status === "ACTIVE",
    ).length;

    const inactiveCount = channels.filter(
        (channel) => channel.status === "INACTIVE",
    ).length;

    const linkedProducts = channels.reduce(
        (total, channel) => total + channel.productCount,
        0,
    );

    function toggleStatus(id: number) {
        setChannels((current) =>
            current.map((channel) =>
                channel.id === id
                    ? {
                        ...channel,
                        status: (
                            channel.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                        ) as SalesChannelStatus,
                    }
                    : channel,
            ),
        );
        setOpenMenuId(null);
    }

    const stats = [
        {
            label: "Total Channels",
            value: channels.length,
            icon: Store,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Active Channels",
            value: activeCount,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            label: "Inactive Channels",
            value: inactiveCount,
            icon: CircleOff,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            label: "Product Listings",
            value: linkedProducts,
            icon: Package,
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
    ];

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
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-semibold">Sales Channels</h1>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Manage sales platforms and their availability.
                    </p>
                </div>

                <Link
                    href="/sales-channels/new"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
                >
                    <Plus size={18} />
                    Add Channel
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-[var(--border)] bg-white p-5"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                                >
                                    <Icon size={19} />
                                </span>
                            </div>
                            <p className="mt-4 text-2xl font-semibold">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="overflow-visible rounded-2xl border border-[var(--border)] bg-white">
                <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold">All Sales Channels</h2>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                            {filteredChannels.length} channels found
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search channels..."
                                className="h-9 w-full rounded-lg border border-[var(--border)] pl-9 pr-3 text-xs outline-none focus:border-[var(--primary)] sm:w-48"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="h-9 rounded-lg border border-[var(--border)] bg-white px-2.5  text-md! outline-none focus:border-[var(--primary)]"
                            aria-label="Filter by status"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-[var(--muted-background)] text-xs uppercase tracking-wide text-[var(--muted)]">
                            <tr>
                                <th className="px-5 py-4 font-medium">Channel</th>
                                <th className="px-5 py-4 font-medium">Code</th>
                                <th className="px-5 py-4 font-medium">Type</th>
                                <th className="px-5 py-4 font-medium">Products</th>
                                <th className="px-5 py-4 font-medium">Status</th>
                                <th className="px-5 py-4 font-medium">Website</th>
                                <th className="px-5 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[var(--border-light)]">
                            {filteredChannels.map((channel) => (
                                <tr key={channel.id} className="hover:bg-[#fafcfb]">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                                                <Store size={18} />
                                            </span>
                                            <div>
                                                <p className="font-medium">{channel.name}</p>
                                                <p className="mt-1 max-w-[220px] truncate text-xs text-[var(--muted)]">
                                                    {channel.description}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 font-mono text-xs">
                                        {channel.code}
                                    </td>

                                    <td className="px-5 py-4">{typeLabel(channel.type)}</td>

                                    <td className="px-5 py-4">{channel.productCount}</td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${channel.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {channel.status === "ACTIVE" ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        {channel.website ? (
                                            <a
                                                href={channel.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={`Open ${channel.name} website`}
                                                className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                                            >
                                                Visit <ExternalLink size={13} />
                                            </a>
                                        ) : (
                                            <span className="text-[var(--muted)]">—</span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <div className="relative inline-block">
                                            <button
                                                type="button"
                                                aria-label={`Actions for ${channel.name}`}
                                                aria-expanded={openMenuId === channel.id}
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId === channel.id ? null : channel.id,
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--muted-background)]"
                                            >
                                                <MoreHorizontal size={19} />
                                            </button>

                                            {openMenuId === channel.id && (
                                                <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-[var(--border)] bg-white p-1 text-left shadow-lg">
                                                    <Link
                                                        href={`/sales-channels/view/${channel.id}`}
                                                        onClick={() => setOpenMenuId(null)}
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[var(--muted-background)]"
                                                    >
                                                        <Eye size={15} /> View
                                                    </Link>

                                                    <Link
                                                        href={`/sales-channels/edit/${channel.id}`}
                                                        onClick={() => setOpenMenuId(null)}
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[var(--muted-background)]"
                                                    >
                                                        <Pencil size={15} /> Edit
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleStatus(channel.id)}
                                                        className="w-full rounded-lg px-3 py-2 text-left hover:bg-[var(--muted-background)]"
                                                    >
                                                        {channel.status === "ACTIVE"
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredChannels.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-12 text-center text-sm text-[var(--muted)]"
                                    >
                                        No sales channels found. Try changing your search or filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
