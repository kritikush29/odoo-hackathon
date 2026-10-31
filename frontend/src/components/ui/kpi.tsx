"use client";

import { useEffect, useRef } from "react";
import { cn, formatINR } from "@/lib/utils";
import gsap from "gsap";

/**
 * KPI tile with count-up animation on mount.
 * Uses IBM Plex Mono for the number and leaf corners.
 */

interface KPIProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  trend?: { value: number; label: string };
  className?: string;
}

export function KPI({
  label,
  value,
  prefix,
  suffix,
  isCurrency,
  trend,
  className,
}: KPIProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!valueRef.current || hasAnimated.current) return;
    hasAnimated.current = true;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      valueRef.current.textContent = isCurrency
        ? formatINR(value)
        : `${prefix || ""}${value.toLocaleString("en-IN")}${suffix || ""}`;
      return;
    }

    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: () => {
        if (!valueRef.current) return;
        const v = Math.round(obj.val);
        valueRef.current.textContent = isCurrency
          ? formatINR(v)
          : `${prefix || ""}${v.toLocaleString("en-IN")}${suffix || ""}`;
      },
    });
  }, [value, prefix, suffix, isCurrency]);

  return (
    <div
      className={cn(
        "bg-surface border border-border shape-leaf px-5 py-4 flex flex-col gap-1",
        className
      )}
    >
      <span className="text-xs font-medium text-muted uppercase tracking-wider">
        {label}
      </span>
      <span
        ref={valueRef}
        className="text-2xl font-semibold font-mono-tabular text-ink"
      >
        {isCurrency ? "₹0.00" : `${prefix || ""}0${suffix || ""}`}
      </span>
      {trend && (
        <span
          className={cn(
            "text-xs font-medium",
            trend.value >= 0 ? "text-status-active" : "text-status-overdue"
          )}
        >
          {trend.value >= 0 ? "+" : ""}
          {trend.value}% {trend.label}
        </span>
      )}
    </div>
  );
}
