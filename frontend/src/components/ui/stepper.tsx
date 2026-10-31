"use client";

import { cn } from "@/lib/utils";

/**
 * Horizontal node stepper for lifecycle flows.
 * Shows a line connecting nodes, with the current node filled.
 * Used for subscription (Draft > Quotation > Confirmed > Active > Closed)
 * and invoice (Draft > Confirmed > Paid) lifecycles.
 */

interface StepperProps {
  steps: string[];
  current: string;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  const currentIndex = steps.indexOf(current);

  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, i) => {
        const isPast = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === steps.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-3.5 h-3.5 rounded-full border-2 transition-all duration-300",
                  isPast && "bg-primary border-primary",
                  isCurrent &&
                    "bg-primary border-primary ring-4 ring-primary/15",
                  !isPast && !isCurrent && "bg-surface border-border"
                )}
              />
              <span
                className={cn(
                  "text-xs whitespace-nowrap transition-colors duration-300",
                  isCurrent
                    ? "text-ink font-semibold"
                    : isPast
                      ? "text-primary font-medium"
                      : "text-muted"
                )}
              >
                {step}
              </span>
            </div>
            {/* Connecting line */}
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 mt-[-18px]">
                <div
                  className={cn(
                    "h-full transition-colors duration-300",
                    isPast ? "bg-primary" : "bg-border"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
