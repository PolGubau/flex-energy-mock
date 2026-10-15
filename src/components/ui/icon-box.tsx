import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type IconBoxVariant =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "muted"
  | "on-dark";

type IconBoxSize = "sm" | "md" | "lg";

interface IconBoxProps {
  children: ReactNode;
  variant?: IconBoxVariant;
  size?: IconBoxSize;
  className?: string;
}

const variantStyles: Record<IconBoxVariant, string> = {
  primary: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
  muted: "bg-muted",
  "on-dark": "bg-white/20",
};

const sizeStyles: Record<IconBoxSize, string> = {
  sm: "size-7 rounded-xl",
  md: "size-8 rounded-xl",
  lg: "size-10 rounded-2xl",
};

export function IconBox({
  children,
  variant = "primary",
  size = "md",
  className,
}: IconBoxProps) {
  return (
    <span
      className={cn(
        "flex items-center justify-center shrink-0",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
