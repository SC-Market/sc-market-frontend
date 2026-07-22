/**
 * Runtime validation + forward-migration for DashboardConfig. Kept dependency-free
 * (no zod) to match the surrounding code; the checks are deliberately lenient —
 * unknown widget types are dropped at render time by the registry, not here.
 */

import {
  CONFIG_VERSION,
  emptyConfig,
  type DashboardConfig,
  type DashboardWidget,
  type WidgetScope,
} from "./types"

function isScope(value: unknown): value is WidgetScope {
  if (!value || typeof value !== "object") return false
  const kind = (value as { kind?: unknown }).kind
  switch (kind) {
    case "me":
    case "current_context":
    case "all_orgs":
    case "all_shops":
      return true
    case "specific_org":
      return typeof (value as { spectrumId?: unknown }).spectrumId === "string"
    case "specific_shop":
      return typeof (value as { shopId?: unknown }).shopId === "string"
    default:
      return false
  }
}

function isWidget(value: unknown): value is DashboardWidget {
  if (!value || typeof value !== "object") return false
  const w = value as Record<string, unknown>
  if (typeof w.id !== "string" || typeof w.type !== "string") return false
  if (!isScope(w.scope)) return false
  const l = w.layout as Record<string, unknown> | undefined
  if (
    !l ||
    typeof l.x !== "number" ||
    typeof l.y !== "number" ||
    typeof l.w !== "number" ||
    typeof l.h !== "number"
  ) {
    return false
  }
  return true
}

/**
 * Migrate a config from an older version to the current one. Currently a no-op
 * beyond version stamping; add cases here as the shape evolves.
 */
function migrate(config: DashboardConfig): DashboardConfig {
  // if (config.version < 2) { ...transform... }
  return { ...config, version: CONFIG_VERSION }
}

/**
 * Parse arbitrary input (server blob, localStorage string, imported file) into a
 * valid DashboardConfig. Invalid widgets are dropped; wholly invalid input yields
 * an empty config. Never throws.
 */
export function parseConfig(input: unknown): DashboardConfig {
  let obj: unknown = input
  if (typeof input === "string") {
    try {
      obj = JSON.parse(input)
    } catch {
      return emptyConfig()
    }
  }
  if (!obj || typeof obj !== "object") return emptyConfig()

  const raw = obj as Record<string, unknown>
  const version = typeof raw.version === "number" ? raw.version : CONFIG_VERSION
  const widgets = Array.isArray(raw.widgets)
    ? (raw.widgets.filter(isWidget) as DashboardWidget[])
    : []

  return migrate({ version, widgets })
}
