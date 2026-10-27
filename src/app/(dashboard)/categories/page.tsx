"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    CheckCircle2,
    MoreHorizontal,
    Plus,
    Search,
    Tag,
    XCircle,
} from "lucide-react";

import { categories as initialCategories } from "@/features/categories/category.data";
import type {
    Category,
    CategoryStatus,
} from "@/features/categories/category.types";

export default function CategoriesPage() {
    const [categories, setCategories] =
        useState<Category[]>(initialCategories);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<"ALL" | CategoryStatus>("ALL");

    const [openMenuId, setOpenMenuId] =
        useState<number | null>(null);

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();

        return categories.filter((category) => {
            const matchesSearch =
                !query ||
                category.name.toLowerCase().includes(query) ||
                category.code.toLowerCase().includes(query) ||
                category.description
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                category.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [categories, search, statusFilter]);

    const totalCategories = categories.length;

    const activeCategories = categories.filter(
        (category) => category.status === "ACTIVE",
    ).length;

    const inactiveCategories = categories.filter(
        (category) => category.status === "INACTIVE",
    ).length;

    const totalProducts = categories.reduce(
        (total, category) =>
            total + category.productCount,
        0,
    );

    const toggleStatus = (id: number) => {
        setCategories((current) =>
            current.map((category) =>
                category.id === id
                    ? {
                        ...category,
                        status:
                            category.status === "ACTIVE"
                                ? "INACTIVE"
                                : "ACTIVE",
                    }
                    : category,
            ),
        );

        setOpenMenuId(null);
    };

    return (
        <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Categories
                    </h1>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Manage product categories and classification.
                    </p>
                </div>

                <Link
                    href="/categories/new"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
                >
                    <Plus size={17} />
                    Add Category
                </Link>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    label="Total Categories"
                    value={totalCategories}
                    icon={<Tag size={18} />}
                />

                <SummaryCard
                    label="Active"
                    value={activeCategories}
                    icon={<CheckCircle2 size={18} />}
                />

                <SummaryCard
                    label="Inactive"
                    value={inactiveCategories}
                    icon={<XCircle size={18} />}
                />

                <SummaryCard
                    label="Products Assigned"
                    value={totalProducts}
                    icon={<Tag size={18} />}
                />
            </div>

            <section className="rounded-xl border border-[var(--border)] bg-white">
                <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-sm">
                        <Search
                            size={17}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                        />

                        <input
                            className="form-input pl-9"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search categories..."
                        />
                    </div>

                    <select
                        className="form-input w-full md:w-40"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value as
                                | "ALL"
                                | CategoryStatus,
                            )
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--muted-background)]">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Category
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Code
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Description
                                </th>

                                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Products
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-b border-[var(--border-light)] transition hover:bg-[var(--muted-background)]"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                                                <Tag size={17} />
                                            </div>

                                            <span className="text-sm font-semibold">
                                                {category.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="rounded-md bg-[var(--muted-background)] px-2 py-1 font-mono text-xs font-medium">
                                            {category.code}
                                        </span>
                                    </td>

                                    <td className="max-w-[340px] px-5 py-4">
                                        <p className="truncate text-sm text-[var(--muted)]">
                                            {category.description || "—"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        <span className="text-sm font-medium">
                                            {category.productCount}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <StatusBadge
                                            status={category.status}
                                        />
                                    </td>

                                    <td className="relative px-5 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenMenuId(
                                                    openMenuId === category.id
                                                        ? null
                                                        : category.id,
                                                )
                                            }
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--border-light)] hover:text-[var(--foreground)]"
                                            aria-label={`Actions for ${category.name}`}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {openMenuId === category.id && (
                                            <div className="absolute right-5 top-12 z-20 w-40 rounded-lg border border-[var(--border)] bg-white p-1.5 text-left shadow-lg">
                                                <Link
                                                    href={`/categories/view/${category.id}`}
                                                    className="block rounded-md px-3 py-2 text-sm hover:bg-[var(--muted-background)]"
                                                    onClick={() => setOpenMenuId(null)}
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/categories/edit/${category.id}`}
                                                    className="block rounded-md px-3 py-2 text-sm hover:bg-[var(--muted-background)]"
                                                    onClick={() =>
                                                        setOpenMenuId(null)
                                                    }
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleStatus(category.id)
                                                    }
                                                    className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--muted-background)]"
                                                >
                                                    {category.status === "ACTIVE"
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <p className="text-sm font-medium">
                                            No categories found
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                            Try changing your search or filter.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-[var(--border)] px-5 py-3">
                    <p className="text-xs text-[var(--muted)]">
                        Showing {filteredCategories.length} of{" "}
                        {categories.length} categories
                    </p>
                </div>
            </section>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--muted)]">
                    {label}
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                    {icon}
                </div>
            </div>

            <p className="mt-3 text-2xl font-semibold">
                {value}
            </p>
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: CategoryStatus;
}) {
    const isActive = status === "ACTIVE";

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isActive
                ? "bg-emerald-50 text-[var(--success)]"
                : "bg-gray-100 text-[var(--muted)]"
                }`}
        >
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}