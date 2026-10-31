"use client";

import { useRef, useEffect } from "react";
import { cn, formatINR } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Animates a number counting up from 0 when it scrolls into view.
 * Uses GSAP ScrollTrigger so it fires once when the element enters the viewport.
 */

interface CountUpProps {
  value: number;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  triggerOnScroll?: boolean;
}

export function CountUp({
  value,
  isCurrency,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className,
  triggerOnScroll = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const display = (v: number) => {
      if (!ref.current) return;
      const rounded = Math.round(v);
      ref.current.textContent = isCurrency
        ? formatINR(rounded)
        : `${prefix}${rounded.toLocaleString("en-IN")}${suffix}`;
    };

    if (prefersReduced) {
      display(value);
      hasAnimated.current = true;
      return;
    }

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration,
      ease: "power3.out",
      paused: true,
      onUpdate: () => display(obj.val),
    });

    if (triggerOnScroll) {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 85%",
        once: true,
        onEnter: () => {
          hasAnimated.current = true;
          tween.play();
        },
      });
    } else {
      hasAnimated.current = true;
      tween.play();
    }

    return () => {
      tween.kill();
    };
  }, [value, isCurrency, prefix, suffix, duration, triggerOnScroll]);

  return (
    <span ref={ref} className={cn("font-mono-tabular", className)}>
      {isCurrency ? "₹0" : `${prefix}0${suffix}`}
    </span>
  );
}
