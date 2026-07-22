/**
 * Export / import of a DashboardConfig as a JSON file (plan §5, M5).
 *
 * A shared file references the *author's* shopId/spectrumId, which are
 * meaningless to the importer. So on import we classify each widget's scope:
 * portable bindings (me, current_context, all_orgs, all_shops) import cleanly;
 * pinned bindings (specific_org, specific_shop) need remapping to one of the
 * importer's own orgs/shops or must be dropped.
 *
 * Widget ids are regenerated on import so a re-import (or a merge into an
 * existing dashboard) never collides with existing widget ids.
 */

import { parseConfig } from "./config"
import { CONFIG_VERSION, type DashboardConfig, type DashboardWidget } from "./types"

/** Envelope written to disk — the config plus a little metadata for humans. */
export interface DashboardExport {
  kind: "sc-market-dashboard"
  version: number
  exportedAt: string
  config: DashboardConfig
}

function freshId(index: number): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
  } catch {}
  // Deterministic-enough fallback; index keeps ids unique within one import.
  return `w-import-${index}-${Math.floor(performance.now())}`
}

/** Serialize a config into the export envelope + filename. */
export function buildExport(
  config: DashboardConfig,
  name: string,
): { json: string; filename: string } {
  const envelope: DashboardExport = {
    kind: "sc-market-dashboard",
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    config,
  }
  const safeName = (name || "dashboard")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return {
    json: JSON.stringify(envelope, null, 2),
    filename: `sc-dashboard-${safeName || "export"}.json`,
  }
}

/** Trigger a browser download of the given config. */
export function downloadConfig(config: DashboardConfig, name: string): void {
  const { json, filename } = buildExport(config, name)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/** A widget whose pinned scope needs the importer to choose a new target. */
export interface PinnedRemap {
  /** Index into the parsed config's widgets array. */
  index: number
  widgetType: string
  kind: "specific_org" | "specific_shop"
  /** The author's original id, shown for reference only. */
  originalId: string
}

export interface ParsedImport {
  /** The validated config (ids already regenerated), pre-remapping. */
  config: DashboardConfig
  /** Widgets that need the importer to pick a target or drop them. */
  remaps: PinnedRemap[]
}

/**
 * Parse a file's text into a config. Accepts both the export envelope and a bare
 * DashboardConfig. Returns the validated config plus the list of pinned widgets
 * that need remapping. Never throws — invalid input yields an empty config.
 */
export function parseImport(text: string): ParsedImport {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { config: { version: CONFIG_VERSION, widgets: [] }, remaps: [] }
  }

  // Unwrap the envelope if present, else treat the object as a bare config.
  const maybeEnvelope = raw as { kind?: unknown; config?: unknown }
  const configSource =
    maybeEnvelope && maybeEnvelope.kind === "sc-market-dashboard"
      ? maybeEnvelope.config
      : raw

  const parsed = parseConfig(configSource)

  // Regenerate ids and collect pinned scopes needing remap.
  const remaps: PinnedRemap[] = []
  const widgets: DashboardWidget[] = parsed.widgets.map((w, index) => {
    const next: DashboardWidget = { ...w, id: freshId(index) }
    if (w.scope.kind === "specific_org" || w.scope.kind === "specific_shop") {
      remaps.push({
        index,
        widgetType: w.type,
        kind: w.scope.kind,
        originalId: w.id,
      })
    }
    return next
  })

  return { config: { ...parsed, widgets }, remaps }
}

/** A resolution the importer chose for one pinned widget. */
export type RemapResolution =
  | { action: "drop" }
  | { action: "org"; spectrumId: string }
  | { action: "shop"; shopId: string }

/**
 * Apply the importer's remap choices to a parsed config, producing the final
 * config to save. `resolutions` is keyed by the widget index from PinnedRemap.
 */
export function applyRemaps(
  parsed: ParsedImport,
  resolutions: Record<number, RemapResolution>,
): DashboardConfig {
  const dropIndices = new Set<number>()

  const widgets = parsed.config.widgets.map((w, index) => {
    const resolution = resolutions[index]
    if (!resolution) return w // portable scope, or left as-is
    switch (resolution.action) {
      case "drop":
        dropIndices.add(index)
        return w
      case "org":
        return {
          ...w,
          scope: { kind: "specific_org" as const, spectrumId: resolution.spectrumId },
        }
      case "shop":
        return {
          ...w,
          scope: { kind: "specific_shop" as const, shopId: resolution.shopId },
        }
    }
  })

  return {
    ...parsed.config,
    widgets: widgets.filter((_, index) => !dropIndices.has(index)),
  }
}
