import type { ReactNode } from "react"
import type { TFunction } from "i18next"
import type { SvgIconComponent } from "@mui/icons-material"
import type { ResolvedScope } from "../useResolveScope"
import type { DashboardWidget, WidgetLayout, WidgetScopeKind } from "../types"

export interface WidgetRenderProps {
  scope: ResolvedScope
  settings?: DashboardWidget["settings"]
  /** Translator, passed so widget render fns can localize their own labels. */
  t: TFunction
}

/**
 * Schematic shape shown for a widget in the add-widget gallery. Not the real
 * widget — a lightweight approximation of its layout so the user can recognize
 * what they're adding without resolving live data.
 */
export type WidgetPreviewKind = "metrics" | "chart" | "table" | "list" | "cards"

/** Grouping used to organize widgets into titled subsections in the gallery. */
export type WidgetCategory = "orders" | "market" | "activity" | "personal"

/** Display order of the gallery's category subsections. */
export const WIDGET_CATEGORY_ORDER: WidgetCategory[] = [
  "orders",
  "market",
  "activity",
  "personal",
]

/** Localized titles for each gallery subsection. */
export const WIDGET_CATEGORY_LABELS: Record<
  WidgetCategory,
  { key: string; default: string }
> = {
  orders: { key: "dashboard.category.orders", default: "Orders & Fulfillment" },
  market: { key: "dashboard.category.market", default: "Market & Listings" },
  activity: { key: "dashboard.category.activity", default: "Activity" },
  personal: { key: "dashboard.category.personal", default: "Personal" },
}

export interface WidgetDefinition {
  type: string
  /** i18n key for the display name (gallery + widget header). */
  titleKey: string
  /** English fallback for the title. */
  titleDefault: string
  /** i18n key for the short description shown in the gallery. */
  descriptionKey: string
  /** English fallback for the description. */
  descriptionDefault: string
  /** Default grid placement (x/y are assigned when added). */
  defaultLayout: Pick<WidgetLayout, "w" | "h">
  /**
   * Minimum grid size (columns × rows) below which the widget's content stops
   * rendering usefully. Applied as react-grid-layout minW/minH on resize.
   * Falls back to DEFAULT_MIN_SIZE when omitted.
   */
  minSize?: Pick<WidgetLayout, "w" | "h">
  /** Scope bindings this widget supports. */
  allowedScopes: WidgetScopeKind[]
  /**
   * When true, the add-widget gallery requires a game item to be picked and
   * stores it as settings.gameItemId / settings.gameItemName.
   */
  requiresItem?: boolean
  /**
   * When true, the add-widget gallery offers a listings source: either a
   * free-text search (settings.query) or a specific game item
   * (settings.gameItemId / settings.gameItemName). Exactly one is stored.
   */
  requiresListingsSource?: boolean
  /**
   * When true, the add-widget gallery offers an optional activity-type filter
   * stored as settings.action (empty = all activity).
   */
  offersActivityFilter?: boolean
  /**
   * When true, the widget's render() already provides its own card + title
   * (a Section or equivalent Paper). WidgetWrapper renders it as-is — no wrapper
   * card and no wrapper header — so there's a single header, not two. Bare
   * widgets (the default) are given a standard Section-styled titled card.
   */
  selfChrome?: boolean
  /** Gallery subsection this widget is grouped under. */
  category: WidgetCategory
  /** Schematic layout shown for this widget in the add-widget gallery. */
  preview: WidgetPreviewKind
  /**
   * Icon shown over the schematic preview. Several widgets share a preview
   * `kind` (e.g. multiple tables); the icon is what makes each recognizable at
   * a glance in the gallery.
   */
  icon: SvgIconComponent
  render: (props: WidgetRenderProps) => ReactNode
}

/** Localized title for a widget definition. */
export function widgetTitle(def: WidgetDefinition, t: TFunction): string {
  return t(def.titleKey, def.titleDefault)
}

/** Localized description for a widget definition. */
export function widgetDescription(def: WidgetDefinition, t: TFunction): string {
  return t(def.descriptionKey, def.descriptionDefault)
}

/** Floor applied to any widget that doesn't declare its own minSize. */
export const DEFAULT_MIN_SIZE: Pick<WidgetLayout, "w" | "h"> = { w: 2, h: 2 }
