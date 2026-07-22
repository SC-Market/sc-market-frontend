/**
 * Dashboard types. The wire shapes (DashboardConfig, DashboardWidget, WidgetScope,
 * WidgetLayout) are generated from the backend OpenAPI spec — re-exported here so
 * the whole feature uses the exact API contract with no divergence or casting.
 * This file adds only frontend-only helpers around those types.
 *
 * Bump CONFIG_VERSION when the shape changes in a non-backward-compatible way and
 * add a migration in ./config.ts migrate().
 */

import type {
  DashboardConfig,
  DashboardOwnerType,
  WidgetScope,
} from "../../store/api/v2/market"

export type {
  DashboardConfig,
  DashboardWidget,
  DashboardLayout,
  WidgetLayout,
  WidgetScope,
  DashboardOwnerType,
} from "../../store/api/v2/market"

export const CONFIG_VERSION = 1

/** The discriminant of a WidgetScope — handy for pickers and allowed-scope lists. */
export type WidgetScopeKind = WidgetScope["kind"]

/** Identifies which dashboard we're editing (owner). */
export interface DashboardOwnerRef {
  ownerType: DashboardOwnerType
  ownerId: string
}

export function emptyConfig(): DashboardConfig {
  return { version: CONFIG_VERSION, widgets: [] }
}
