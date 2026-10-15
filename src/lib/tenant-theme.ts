/**
 * Tenant Theme — runtime CSS variable injection.
 *
 * Only the brand-level tokens are overridable per tenant.
 * Semantic tokens (success, warning, destructive) and surfaces stay fixed
 * unless explicitly provided.
 *
 * Usage (admin panel saves this JSON, app loads it on init):
 *   applyTenantTheme({ primary: "oklch(0.53 0.195 258)", ... })
 *
 * Persistence: localStorage key "tenant-theme"
 * Future: fetch from API by tenantId, merge with defaults.
 */

export interface TenantTheme {
  /** Main brand color — drives buttons, links, active states */
  primary: string;
  /** Text on primary backgrounds */
  primaryForeground?: string;
  /** Supporting brand color */
  secondary?: string;
  secondaryForeground?: string;
  secondaryContainer?: string;
  secondaryContainerForeground?: string;
  /** Accent / tertiary color */
  tertiary?: string;
  tertiaryForeground?: string;
  tertiaryContainer?: string;
  tertiaryContainerForeground?: string;
  /** Focus ring — usually same hue as primary */
  ring?: string;
}

const STYLE_TAG_ID = "tenant-theme";
const STORAGE_KEY = "tenant-theme";

/** Maps TenantTheme keys → CSS variable names */
const TOKEN_MAP: Record<keyof TenantTheme, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  secondaryContainer: "--secondary-container",
  secondaryContainerForeground: "--secondary-container-foreground",
  tertiary: "--tertiary",
  tertiaryForeground: "--tertiary-foreground",
  tertiaryContainer: "--tertiary-container",
  tertiaryContainerForeground: "--tertiary-container-foreground",
  ring: "--ring",
};

/** Inject (or replace) a <style> tag that overrides :root CSS variables. */
export function applyTenantTheme(theme: Partial<TenantTheme>): void {
  const declarations = (Object.entries(theme) as [keyof TenantTheme, string][])
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `  ${TOKEN_MAP[key]}: ${value};`)
    .join("\n");

  if (!declarations) return;

  const css = `:root {\n${declarations}\n}`;

  let tag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement("style");
    tag.id = STYLE_TAG_ID;
    document.head.appendChild(tag);
  }
  tag.textContent = css;
}

/** Remove tenant overrides and restore index.css defaults. */
export function resetTenantTheme(): void {
  document.getElementById(STYLE_TAG_ID)?.remove();
}

/** Persist theme to localStorage (for demo/preview use). */
export function saveTenantTheme(theme: Partial<TenantTheme>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  applyTenantTheme(theme);
}

/** Load and apply any persisted theme on app boot. */
export function loadPersistedTheme(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) applyTenantTheme(JSON.parse(raw) as Partial<TenantTheme>);
  } catch {
    // corrupted storage — ignore silently
  }
}

/** Returns the currently persisted theme id, or "default". */
export function getActiveThemeId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "default";
    const parsed = JSON.parse(raw) as Partial<TenantTheme> & { _id?: string };
    return parsed._id ?? "default";
  } catch {
    return "default";
  }
}

// ─── Demo presets ──────────────────────────────────────────────────────────────

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  /** Hex approximation for the swatch UI only */
  swatch: string;
  theme: Partial<TenantTheme>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "FlexEnergy",
    description: "Default blue",
    swatch: "#2563eb",
    theme: {},
  },
  {
    id: "forest",
    name: "Forest",
    description: "Sustainable green",
    swatch: "#16a34a",
    theme: {
      primary: "oklch(0.52 0.165 155)",
      secondary: "oklch(0.54 0.06 155)",
      secondaryContainer: "oklch(0.93 0.04 155)",
      tertiary: "oklch(0.60 0.13 100)",
      ring: "oklch(0.52 0.165 155)",
    },
  },
  {
    id: "solar",
    name: "Solar",
    description: "Warm orange",
    swatch: "#ea580c",
    theme: {
      primary: "oklch(0.60 0.19 48)",
      secondary: "oklch(0.58 0.08 48)",
      secondaryContainer: "oklch(0.95 0.04 48)",
      tertiary: "oklch(0.65 0.14 75)",
      ring: "oklch(0.60 0.19 48)",
    },
  },
  {
    id: "violet",
    name: "Violet",
    description: "MD3 expressive",
    swatch: "#7c3aed",
    theme: {
      primary: "oklch(0.50 0.23 285)",
      secondary: "oklch(0.54 0.06 285)",
      secondaryContainer: "oklch(0.93 0.03 285)",
      tertiary: "oklch(0.62 0.16 330)",
      ring: "oklch(0.50 0.23 285)",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Bold & modern",
    swatch: "#e11d48",
    theme: {
      primary: "oklch(0.55 0.22 10)",
      secondary: "oklch(0.56 0.07 10)",
      secondaryContainer: "oklch(0.95 0.03 10)",
      tertiary: "oklch(0.62 0.14 330)",
      ring: "oklch(0.55 0.22 10)",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Corporate neutral",
    swatch: "#475569",
    theme: {
      primary: "oklch(0.45 0.07 240)",
      secondary: "oklch(0.50 0.04 240)",
      secondaryContainer: "oklch(0.93 0.02 240)",
      tertiary: "oklch(0.55 0.10 210)",
      ring: "oklch(0.45 0.07 240)",
    },
  },
];
