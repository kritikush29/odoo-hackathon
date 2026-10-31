"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Draws a horizontal lifecycle line with ScrollTrigger.
 * Each node fills sequentially as the user scrolls into view.
 * Used on the landing page to show the subscription lifecycle.
 */

interface LifecycleLineProps {
  steps: string[];
  className?: string;
}

export function LifecycleLine({ steps, className }: LifecycleLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        // Show all nodes filled immediately
        const nodes = containerRef.current?.querySelectorAll(".lc-node-fill");
        nodes?.forEach((n) => gsap.set(n, { scale: 1 }));
        const lines = containerRef.current?.querySelectorAll(".lc-line-fill");
        lines?.forEach((l) => gsap.set(l, { scaleX: 1 }));
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          once: true,
        },
      });

      steps.forEach((_, i) => {
        const node = container.querySelector(`.lc-node-${i} .lc-node-fill`);
        if (node) {
          tl.to(node, { scale: 1, duration: 0.3, ease: "power3.out" }, i * 0.25);
        }
        if (i < steps.length - 1) {
          const line = container.querySelector(`.lc-line-${i} .lc-line-fill`);
          if (line) {
            tl.to(line, { scaleX: 1, duration: 0.4, ease: "power3.out" }, i * 0.25 + 0.15);
          }
        }
      });
    },
    { scope: containerRef, dependencies: [steps] }
  );

  return (
    <div
      ref={containerRef}
      className={cn("flex items-center justify-center w-full", className)}
    >
      {steps.map((step, i) => (
        <div
          key={step}
          className="flex items-center"
        >
          {/* Node */}
          <div className={`lc-node-${i} flex flex-col items-center gap-2`}>
            <div className="relative w-5 h-5">
              {/* Empty ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary" />
              {/* Fill circle, starts at scale 0 */}
              <div
                className="lc-node-fill absolute inset-[3px] rounded-full bg-primary"
                style={{ transform: "scale(0)" }}
              />
            </div>
            <span className="text-xs font-medium text-muted whitespace-nowrap">
              {step}
            </span>
          </div>

          {/* Connecting line */}
          {i < steps.length - 1 && (
            <div
              className={`lc-line-${i} w-12 sm:w-20 h-0.5 mx-1 mt-[-20px] bg-border relative overflow-hidden`}
            >
              <div
                className="lc-line-fill absolute inset-0 bg-primary origin-left"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
