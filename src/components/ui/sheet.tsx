import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

const SheetOverlay = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Overlay>) => (
  <Dialog.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
);

interface SheetContentProps {
  side?: "bottom" | "right";
  className?: string;
  children?: React.ReactNode;
}

const SheetContent = ({
  side = "bottom",
  className,
  children,
}: SheetContentProps) => (
  <SheetPortal>
    <SheetOverlay />
    <Dialog.Content
      className={cn(
        "fixed z-50 bg-background shadow-xl focus:outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out duration-300 ease-out",
        side === "bottom" && [
          "bottom-0 left-0 right-0 rounded-t-[28px] max-h-[90vh] overflow-y-auto",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        ],
        side === "right" && [
          "right-0 top-0 bottom-0 w-full max-w-sm",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        ],
        className,
      )}
    >
      {/* Drag handle (bottom sheet) */}
      {side === "bottom" && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
      )}
      {children}
      <Dialog.Close className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </Dialog.Close>
    </Dialog.Content>
  </SheetPortal>
);

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-5 pb-4 pt-2", className)} {...props} />
);

const SheetTitle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Title>) => (
  <Dialog.Title
    className={cn("text-lg font-bold text-foreground", className)}
    {...props}
  />
);

const SheetDescription = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Description>) => (
  <Dialog.Description
    className={cn("text-sm text-muted-foreground mt-0.5", className)}
    {...props}
  />
);

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
