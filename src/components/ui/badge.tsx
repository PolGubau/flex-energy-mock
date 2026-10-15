/**
 * StatusBadge — maps a service status string to a friendly label + semantic colour.
 * Active / NormalState → success, Warning/Grace/GraceState → warning, everything else → destructive.
 */
interface StatusBadgeProps {
  status: string;
}

// Normalised (lowercase) → display label
const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  normalstate: "Active",
  normal: "Active",
  warning: "Warning",
  grace: "Grace period",
  gracestate: "Grace period",
  suspended: "Suspended",
  closed: "Closed",
};

const ACTIVE_KEYS = new Set(["active", "normalstate", "normal"]);
const WARNING_KEYS = new Set(["warning", "grace", "gracestate"]);

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const label = STATUS_LABEL[key] ?? status;

  const isActive = ACTIVE_KEYS.has(key);
  const isWarning = WARNING_KEYS.has(key);

  const cls = isActive
    ? "bg-success/10 text-success"
    : isWarning
      ? "bg-warning/10 text-warning"
      : "bg-destructive/10 text-destructive";

  const dot = isActive
    ? "bg-success"
    : isWarning
      ? "bg-warning"
      : "bg-destructive";

  return (
    <span
      className={`inline-flex line-clamp-1 min-w-fit items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
