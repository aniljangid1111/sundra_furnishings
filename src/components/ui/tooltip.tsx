"use client";

import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "start" | "center" | "end";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  align?: TooltipAlign;
  className?: string;
  delayMs?: number;
}

export function Tooltip({
  content,
  children,
  position = "top",
  align = "center",
  className = "",
  delayMs = 120,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delayMs);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  // Horizontal alignment helper when position is top or bottom
  let alignClass = "left-1/2 -translate-x-1/2";
  let arrowAlignClass = "left-1/2 -translate-x-1/2";

  if (align === "end") {
    alignClass = "right-0 translate-x-0";
    arrowAlignClass = "right-2 translate-x-0";
  } else if (align === "start") {
    alignClass = "left-0 translate-x-0";
    arrowAlignClass = "left-2 translate-x-0";
  }

  // Position classes
  const positionClasses: Record<TooltipPosition, string> = {
    top: `bottom-full mb-2 ${alignClass}`,
    bottom: `top-full mt-2 ${alignClass}`,
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses: Record<TooltipPosition, string> = {
    top: `top-full border-t-slate-900 border-x-transparent border-b-transparent ${arrowAlignClass}`,
    bottom: `bottom-full border-b-slate-900 border-x-transparent border-t-transparent ${arrowAlignClass}`,
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && content && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-50 whitespace-normal rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-normal text-white shadow-xl transition-all animate-in fade-in-0 zoom-in-95 max-w-xs ${positionClasses[position]}`}
          style={{ width: "max-content", maxWidth: "240px" }}
        >
          {content}
          <div
            className={`absolute h-0 w-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Convenience helper for inline info icon with tooltip
 */
export function InfoTooltip({
  content,
  position = "top",
  align = "center",
  size = 14,
  className = "",
}: {
  content: ReactNode;
  position?: TooltipPosition;
  align?: TooltipAlign;
  size?: number;
  className?: string;
}) {
  return (
    <Tooltip content={content} position={position} align={align} className={className}>
      <button
        type="button"
        tabIndex={0}
        aria-label="More information"
        className="inline-flex items-center text-[var(--muted)] transition hover:text-[var(--foreground)] cursor-help focus:outline-none"
      >
        <Info size={size} />
      </button>
    </Tooltip>
  );
}
