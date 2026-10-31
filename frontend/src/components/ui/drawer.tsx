"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "right" | "left";
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const animateIn = useCallback(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const dur = prefersReduced ? 0 : 0.35;
    gsap.to(overlayRef.current, { opacity: 1, duration: dur, ease: "power3.out" });
    gsap.fromTo(
      panelRef.current,
      { x: side === "right" ? "100%" : "-100%" },
      { x: "0%", duration: dur, ease: "power3.out" }
    );
  }, [side]);

  const animateOut = useCallback(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const dur = prefersReduced ? 0 : 0.25;
    gsap.to(overlayRef.current, { opacity: 0, duration: dur });
    gsap.to(panelRef.current, {
      x: side === "right" ? "100%" : "-100%",
      duration: dur,
      ease: "power3.out",
      onComplete: onClose,
    });
  }, [side, onClose]);

  useEffect(() => {
    if (open) animateIn();
  }, [open, animateIn]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") animateOut();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, animateOut]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-ink/20 opacity-0"
        onClick={animateOut}
      />
      {/* Panel: full-screen on mobile, side panel on desktop */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute top-0 bottom-0 bg-surface border-border flex flex-col",
          "w-full sm:w-[480px] md:w-[540px]",
          side === "right"
            ? "right-0 border-l"
            : "left-0 border-r",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold font-[var(--font-bricolage)]">
            {title}
          </h2>
          <button
            onClick={animateOut}
            className="p-1.5 text-muted hover:text-ink transition-colors shape-leaf hover:bg-sand/30 cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
