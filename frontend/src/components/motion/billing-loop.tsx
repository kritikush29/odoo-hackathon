"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

/**
 * Animated billing loop for the landing page hero.
 * A dashed circle with a terracotta dot orbiting around it,
 * representing the recurring billing cycle.
 */

interface BillingLoopProps {
  size?: number;
  className?: string;
}

export function BillingLoop({ size = 200, className }: BillingLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      const radius = size / 2 - 8;
      const centerX = size / 2;
      const centerY = size / 2;

      // Orbit the terracotta dot around the dashed circle
      gsap.to(
        { angle: 0 },
        {
          angle: 360,
          duration: 6,
          repeat: -1,
          ease: "none",
          onUpdate: function () {
            if (!dotRef.current) return;
            const angle = (this.targets()[0].angle * Math.PI) / 180;
            const x = centerX + radius * Math.cos(angle) - 6;
            const y = centerY + radius * Math.sin(angle) - 6;
            dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
          },
        }
      );
    },
    { scope: containerRef, dependencies: [size] }
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {/* Dashed circle */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        className="absolute inset-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="var(--color-border)"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
        />
      </svg>
      {/* Orbiting terracotta dot */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0 w-3 h-3 rounded-full bg-accent"
        style={{ transform: `translate(${size - 14}px, ${size / 2 - 6}px)` }}
      />
    </div>
  );
}
