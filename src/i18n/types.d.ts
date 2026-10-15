/**
 * i18next TypeScript integration.
 *
 * We intentionally leave CustomTypeOptions unset so the `t()` function
 * accepts any string key (no strict key-checking). This avoids the i18next
 * v26 requirement to prefix every key with "translation:" while still giving
 * full runtime correctness.
 *
 * IDE autocomplete is available via the `en` locale object itself — import it
 * and reference its keys when writing new calls.
 *
 * Once the project migrates to a backend-driven i18n provider, strict key
 * types can be re-enabled here without touching any component.
 */
export {};

