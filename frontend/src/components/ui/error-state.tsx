"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[#FBECE9] flex items-center justify-center text-status-overdue mb-4">
        <WarningCircle size={28} />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1 font-[var(--font-bricolage)]">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-xs mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
