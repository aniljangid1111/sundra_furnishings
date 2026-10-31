"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";

export type TimeRange = "TODAY" | "7D" | "30D" | "ALL" | "CUSTOM";

interface DateRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

export function DateRangeFilter({
  value,
  onChange,
  startDate = "2026-10-01",
  endDate = "2026-10-28",
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomClick = () => {
    onChange("CUSTOM");
    setIsPopoverOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Pills Container */}
      <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white p-1 text-xs font-medium shadow-2xs">
        {/* Preset 1: Today */}
        <button
          type="button"
          onClick={() => {
            onChange("TODAY");
            setIsPopoverOpen(false);
          }}
          className={`rounded-lg px-2.5 sm:px-3 py-1.5 transition whitespace-nowrap ${
            value === "TODAY"
              ? "bg-[var(--primary)] text-white! shadow-xs font-semibold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Today
        </button>

        {/* Preset 2: Last 7 Days */}
        <button
          type="button"
          onClick={() => {
            onChange("7D");
            setIsPopoverOpen(false);
          }}
          className={`rounded-lg px-2.5 sm:px-3 py-1.5 transition whitespace-nowrap ${
            value === "7D"
              ? "bg-[var(--primary)] text-white! shadow-xs font-semibold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <span className="hidden sm:inline">Last </span>7 Days
        </button>

        {/* Preset 3: Last 30 Days */}
        <button
          type="button"
          onClick={() => {
            onChange("30D");
            setIsPopoverOpen(false);
          }}
          className={`rounded-lg px-2.5 sm:px-3 py-1.5 transition whitespace-nowrap ${
            value === "30D"
              ? "bg-[var(--primary)] text-white! shadow-xs font-semibold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <span className="hidden sm:inline">Last </span>30 Days
        </button>

        {/* Preset 4: All Time */}
        <button
          type="button"
          onClick={() => {
            onChange("ALL");
            setIsPopoverOpen(false);
          }}
          className={`rounded-lg px-2.5 sm:px-3 py-1.5 transition whitespace-nowrap ${
            value === "ALL"
              ? "bg-[var(--primary)] text-white! shadow-xs font-semibold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          All Time
        </button>

        {/* Preset 5: Custom (STRICTLY LAST) */}
        <button
          type="button"
          onClick={handleCustomClick}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 transition whitespace-nowrap ${
            value === "CUSTOM"
              ? "bg-[var(--primary)] text-white! shadow-xs font-semibold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Calendar size={13} className="shrink-0" />
          <span>Custom</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-150 shrink-0 ${
              isPopoverOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Floating Popover Dropdown (NEVER breaks header layout) */}
      {isPopoverOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border)] bg-white p-3.5 shadow-xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Calendar size={14} className="text-[var(--primary)]" />
              <span>Select Custom Range</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-2xs font-semibold text-slate-600 block mb-1">
                From Date:
              </label>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => {
                  const newStart = e.target.value;
                  onStartDateChange?.(newStart);
                  // Validation: If new start date is after current end date, advance end date to match start date
                  if (endDate && newStart && newStart > endDate) {
                    onEndDateChange?.(newStart);
                  }
                }}
                className="form-input h-8 text-xs py-1 px-2.5 w-full font-mono rounded-lg border border-[var(--border)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-600 block mb-1">
                To Date (Min: {startDate || "From Date"}):
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  // Validation: To Date cannot be earlier than From Date
                  if (startDate && newEnd && newEnd < startDate) {
                    onEndDateChange?.(startDate);
                  } else {
                    onEndDateChange?.(newEnd);
                  }
                }}
                className="form-input h-8 text-xs py-1 px-2.5 w-full font-mono rounded-lg border border-[var(--border)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {startDate && endDate && startDate > endDate && (
              <p className="text-2xs text-rose-600 font-medium">
                &quot;To Date&quot; must be equal to or after &quot;From Date&quot;.
              </p>
            )}

            <div className="pt-2 border-t border-[var(--border-light)] flex items-center justify-between">
              <span className="text-2xs text-slate-500 font-mono">
                {startDate} → {endDate}
              </span>
              <button
                type="button"
                onClick={() => setIsPopoverOpen(false)}
                disabled={Boolean(startDate && endDate && startDate > endDate)}
                className="rounded-lg bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white! shadow-xs hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
