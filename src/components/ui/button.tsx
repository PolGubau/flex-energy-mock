import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-muted text-foreground hover:bg-muted/80",
  ghost: "text-foreground hover:bg-muted/60",
  destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  outline: "border border-border bg-card text-foreground hover:bg-muted/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-2xl gap-2",
  lg: "px-5 py-3.5 text-sm rounded-2xl gap-2",
  icon: "p-2 rounded-xl",
};

export const Button = ({
  variant = "primary",
  size = "md",
  asChild = false,
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all active:scale-[0.97]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        children
      )}
    </Comp>
  );
};
