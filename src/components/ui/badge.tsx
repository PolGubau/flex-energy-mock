/**
 * StatusBadge — maps a service status string to a friendly label + semantic colour.
 * Active / NormalState → success, Warning/Grace/GraceState → warning, everything else → destructive.
 */
import { useTranslation } from "react-i18next";

interface StatusBadgeProps {
  status: string;
}

const ACTIVE_KEYS = new Set(["active", "normalstate", "normal"]);
const POWER_REDUCED_KEYS = new Set([
  "reduced",
  "powerreduced",
  "power_reduced",
]);

function getStatusKey(status: string) {
  const key = status.toLowerCase();

  if (ACTIVE_KEYS.has(key)) return "active";
  if (POWER_REDUCED_KEYS.has(key)) return "powerReduced";
  if (["warning", "grace", "gracestate", "suspended", "lockstate", "closed"].includes(key)) {
    return "blocked";
  }

  return "unknown";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const statusKey = getStatusKey(status);
  const isActive = statusKey === "active";
  const isPowerReduced = statusKey === "powerReduced";

  const cls = isActive
    ? "bg-success/10 text-success"
    : isPowerReduced
      ? "bg-warning/10 text-warning"
      : "bg-destructive/10 text-destructive";

  const dot = isActive
    ? "bg-success"
    : isPowerReduced
      ? "bg-warning"
      : "bg-destructive";

  return (
    <span
      className={`inline-flex line-clamp-1 min-w-fit items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {t(`dashboard.status.${statusKey}`)}
    </span>
  );
}
