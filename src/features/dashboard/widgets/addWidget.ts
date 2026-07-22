/**
 * Helpers for adding a widget to a DashboardConfig — assigns a stable id and a
 * grid position at the bottom of the current layout.
 */

import { getWidgetDefinition } from "./registry"
import type { DashboardConfig, DashboardWidget, WidgetScope } from "../types"

const COLUMNS = 12

function nextId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
  } catch {}
  return `w-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

/** The y just below the current lowest widget, so new widgets stack at the end. */
function bottomY(config: DashboardConfig): number {
  return config.widgets.reduce(
    (max, w) => Math.max(max, w.layout.y + w.layout.h),
    0,
  )
}

export function addWidget(
  config: DashboardConfig,
  type: string,
  scope: WidgetScope,
  settings?: DashboardWidget["settings"],
): DashboardConfig {
  const def = getWidgetDefinition(type)
  if (!def) return config

  const widget: DashboardWidget = {
    id: nextId(),
    type,
    scope,
    layout: {
      x: 0,
      y: bottomY(config),
      w: Math.min(def.defaultLayout.w, COLUMNS),
      h: def.defaultLayout.h,
    },
    ...(settings && Object.keys(settings).length > 0 ? { settings } : {}),
  }

  return { ...config, widgets: [...config.widgets, widget] }
}

export function removeWidget(
  config: DashboardConfig,
  id: string,
): DashboardConfig {
  return { ...config, widgets: config.widgets.filter((w) => w.id !== id) }
}
