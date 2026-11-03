"use client";

import React, { useEffect, useState, useId } from "react";

interface CountUpProps {
  value: number | string | undefined | null;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number; // total spin duration in ms
  className?: string;
}

// 4 complete cycles of 0-9 so the reel spins through multiple rotations
const CYCLES = 4;
const SINGLE_DIGIT_LIST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const REEL_DIGITS: number[] = [];
for (let c = 0; c < CYCLES; c++) {
  REEL_DIGITS.push(...SINGLE_DIGIT_LIST);
}
const TOTAL_ITEMS = REEL_DIGITS.length; // 40 items

/**
 * Individual Rolling Slot-Machine / Meter Digit Column
 */
function SlotDigit({
  targetDigit,
  delayMs,
  durationMs,
  isMounted,
}: {
  targetDigit: number;
  delayMs: number;
  durationMs: number;
  isMounted: boolean;
}) {
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!isMounted) return;
    setHasTriggered(false);
    // Double requestAnimationFrame ensures initial translate(0) is painted before spinning
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHasTriggered(true);
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [targetDigit, isMounted]);

  // Land on the last cycle's target digit for maximum spinning effect
  const finalIndex = (CYCLES - 1) * 10 + targetDigit;
  const targetPercent = (finalIndex / TOTAL_ITEMS) * 100;

  return (
    <span
      className="inline-block relative overflow-hidden align-baseline tabular-nums select-none"
      style={{
        height: "1.18em",
        lineHeight: "1.18em",
      }}
    >
      <span
        className="inline-flex flex-col will-change-transform"
        style={{
          transform: `translateY(-${hasTriggered ? targetPercent : 0}%)`,
          transitionProperty: "transform",
          transitionDuration: `${durationMs}ms`,
          transitionTimingFunction: "cubic-bezier(0.12, 0.82, 0.22, 1)", // Snappy mechanical odometer curve
          transitionDelay: `${delayMs}ms`,
        }}
      >
        {REEL_DIGITS.map((digit, idx) => (
          <span
            key={idx}
            className="flex items-center justify-center"
            style={{
              height: "1.18em",
              lineHeight: "1.18em",
            }}
          >
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Rolling Slot-Machine / Odometer Counter Component
 * Converts numbers into rolling mechanical reels that spin into position.
 */
export function CountUp({
  value,
  isLoading = false,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1100,
  className = "",
}: CountUpProps) {
  const [isMounted, setIsMounted] = useState(false);
  const componentId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading) {
    return <span className={className}>—</span>;
  }

  const numeric = typeof value === "number" ? value : Number(value) || 0;

  const formattedStr = numeric.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Server-side fallback or static render until hydration
  if (!isMounted) {
    return (
      <span className={className}>
        {prefix}
        {formattedStr}
        {suffix}
      </span>
    );
  }

  // Count digit characters to calculate progressive reel delays
  let digitCounter = 0;

  return (
    <span className={`inline-flex items-baseline font-mono tabular-nums ${className}`}>
      {prefix && (
        <span className="inline-block mr-[0.5px] select-none font-sans font-bold">
          {prefix}
        </span>
      )}

      {formattedStr.split("").map((char, index) => {
        const isDigit = char >= "0" && char <= "9";

        if (!isDigit) {
          // Static separators like commas and decimal points
          return (
            <span
              key={`${componentId}-sep-${index}`}
              className="inline-block select-none"
              style={{
                height: "1.18em",
                lineHeight: "1.18em",
                paddingLeft: char === "," ? "1px" : "1.5px",
                paddingRight: char === "," ? "1.5px" : "1px",
              }}
            >
              {char}
            </span>
          );
        }

        const digitVal = parseInt(char, 10);
        const delay = digitCounter * 45; // 45ms stagger per digit reel
        digitCounter++;

        return (
          <SlotDigit
            key={`${componentId}-digit-${index}`}
            targetDigit={digitVal}
            delayMs={delay}
            durationMs={duration}
            isMounted={isMounted}
          />
        );
      })}

      {suffix && (
        <span className="inline-block ml-1 select-none font-sans text-[0.8em] font-normal text-[var(--muted)]">
          {suffix}
        </span>
      )}
    </span>
  );
}
