"use client";

import React from "react";
import { cn, getStatusType, type StatusType } from "@/lib/utils";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: StatusType;
  dot?: boolean;
}

export function Chip({
  status,
  variant,
  dot = true,
  className,
  children,
  ...props
}: ChipProps) {
  const resolvedType = variant || (status ? getStatusType(status) : "draft");

  const colors: Record<StatusType, { bg: string; text: string; dot: string; border: string }> = {
    active: {
      bg: "bg-[#EAF3EC]",
      text: "text-[#2F6B3A]",
      dot: "bg-[#2F6B3A]",
      border: "border-[#B8D8BF]",
    },
    confirmed: {
      bg: "bg-[#EBF1F7]",
      text: "text-[#2C4A6B]",
      dot: "bg-[#2C4A6B]",
      border: "border-[#B5CBDD]",
    },
    draft: {
      bg: "bg-[#EFEFEF]",
      text: "text-[#6A6A64]",
      dot: "bg-[#7A7A72]",
      border: "border-[#D6D6D0]",
    },
    paused: {
      bg: "bg-[#FDF6E8]",
      text: "text-[#8E6514]",
      dot: "bg-[#A87B1E]",
      border: "border-[#EAD39E]",
    },
    overdue: {
      bg: "bg-[#FBECE9]",
      text: "text-[#A3321F]",
      dot: "bg-[#A3321F]",
      border: "border-[#E8B1A7]",
    },
  };

  const style = colors[resolvedType] || colors.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-leaf border transition-transform",
        style.bg,
        style.text,
        style.border,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />}
      <span>{children || status}</span>
    </span>
  );
}
