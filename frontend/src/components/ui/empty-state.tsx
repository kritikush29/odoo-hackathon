"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-sand/40 flex items-center justify-center text-muted mb-4">
        {icon || <MagnifyingGlass size={28} />}
      </div>
      <h3 className="text-base font-semibold text-ink mb-1 font-[var(--font-bricolage)]">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
