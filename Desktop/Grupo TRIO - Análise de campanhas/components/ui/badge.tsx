import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ContactStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_BG_COLORS,
} from "@/types";

interface StatusBadgeProps {
  status: ContactStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const bg = STATUS_BG_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{ color, backgroundColor: bg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-gold/20 text-trio-wine",
        variant === "outline" && "border border-gold/40 text-trio-wine",
        className
      )}
      {...props}
    />
  );
}
