"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * Reveals each word in a heading by sliding up from a mask.
 * Used on landing and auth pages.
 */

interface WordRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
}

export function WordReveal({
  text,
  as: Tag = "h1",
  className,
  delay = 0,
  stagger = 0.06,
}: WordRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      const words = containerRef.current?.querySelectorAll(".word-inner");
      if (!words) return;

      gsap.fromTo(
        words,
        { y: "110%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.6,
          stagger,
          delay,
          ease: "power3.out",
        }
      );
    },
    { scope: containerRef }
  );

  const words = text.split(" ");

  return (
    <Tag ref={containerRef as React.RefObject<HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <span className="word-inner inline-block opacity-0">{word}</span>
        </span>
      ))}
    </Tag>
  );
}
