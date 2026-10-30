"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({
  onMenuClick,
}: HeaderProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur sm:px-5 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--muted-background)] lg:hidden"
        >
          <Menu size={19} />
        </button>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoices, products, customers..."
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--muted-background)] pl-9 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:bg-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-3">
        {/* <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--muted-background)] hover:text-[var(--foreground)]"
        >
          <Bell size={17} strokeWidth={1.8} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
        </button> */}

        {/* <div className="hidden h-8 w-px bg-[var(--border)] sm:block" /> */}

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition hover:bg-[var(--muted-background)] sm:px-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-light)] text-sm font-semibold text-[var(--primary)]">
            S
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Sundara Furnishings
            </p>

            <p className="text-xs text-[var(--muted)]">
              Administrator
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-[var(--muted)] md:block"
          />
        </button>
      </div>
    </header>
  );
}