/**
 * WidgetWrapper — common chrome around each dashboard widget. There is always a
 * single header per widget, never two:
 *
 * - Bare widgets (default): the wrapper renders a standard titled card (matching
 *   the app's Section style) with the widget title + resolved scope label.
 * - Self-chromed widgets (`selfChrome: true`): the widget's own render() already
 *   provides a Section/Paper with its own title, so the wrapper renders it as-is
 *   and adds no card and no title of its own.
 *
 * In edit mode a drag handle + remove control float as an overlay in the corner
 * so they work identically for both kinds. Scope-resolution / unavailable /
 * aggregate placeholder states are handled here for both.
 */

import { Alert, Box, Divider, IconButton, Paper, Tooltip, Typography } from "@mui/material"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import CloseIcon from "@mui/icons-material/Close"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { useResolveScope } from "../useResolveScope"
import { useAggregateTargets } from "../useAggregateTargets"
import { getWidgetDefinition, widgetTitle, type WidgetDefinition } from "./registry"
import type { DashboardWidget } from "../types"

export interface WidgetWrapperProps {
  widget: DashboardWidget
  editing: boolean
  onRemove?: (id: string) => void
  /**
   * The widget sits in a fixed-size grid cell (default). Self-chromed cards are
   * then sized to the cell and their content scrolls inside the card, both ways.
   * Pass false where the slot grows with its content (the stacked phone layout).
   */
  fitCell?: boolean
}

export function WidgetWrapper({ widget, editing, onRemove, fitCell = true }: WidgetWrapperProps) {
  const { t } = useTranslation()
  const definition = getWidgetDefinition(widget.type)
  const scope = useResolveScope(widget.scope)

  if (!definition) {
    // Unknown widget type in a saved config — render nothing rather than crash.
    return null
  }

  const showScopeLabel =
    widget.scope.kind !== "me" && widget.scope.kind !== "current_context"

  // Body: placeholder states first, then the widget (or per-target aggregate).
  const body = scope.unavailable ? (
    <Alert severity="warning" variant="outlined">
      {widget.scope.kind === "specific_shop"
        ? t(
            "dashboard.unavailableShop",
            "This widget's shop is no longer available. Remove it or pick a new scope.",
          )
        : t(
            "dashboard.unavailableOrg",
            "This widget's organization is no longer available. Remove it or pick a new scope.",
          )}
    </Alert>
  ) : scope.aggregate ? (
    <AggregateWidget
      aggregate={scope.aggregate}
      definition={definition}
      settings={widget.settings}
      t={t}
    />
  ) : (
    definition.render({ scope, settings: widget.settings, t })
  )

  // The edit overlay (drag handle + remove) floats in the top-right corner so it
  // works whether or not the widget draws its own header.
  const editOverlay = editing ? (
    <Box
      sx={{
        position: "absolute",
        top: 4,
        right: 4,
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        borderRadius: 1,
        bgcolor: "background.paper",
        boxShadow: 1,
      }}
    >
      <Box
        className="dashboard-widget-drag-handle"
        sx={{ cursor: "move", display: "flex", color: "text.secondary", p: 0.5 }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      {onRemove && (
        <Tooltip title={t("dashboard.removeWidget", "Remove widget")}>
          <IconButton
            size="small"
            aria-label={t("dashboard.removeWidget", "Remove widget")}
            onClick={() => onRemove(widget.id)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  ) : null

  // Self-chromed widgets already render their own card + title. Render them as-is
  // (no wrapper card, no wrapper header) with just the edit overlay on top.
  if (definition.selfChrome) {
    return (
      <Box
        sx={{
          position: "relative",
          height: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          ...(fitCell ? SELF_CHROME_FIT_CELL : SELF_CHROME_GROW),
        }}
      >
        {editOverlay}
        {body}
      </Box>
    )
  }

  // Bare widgets get a standard titled card matching the app's Section style.
  return (
    <Paper
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {editOverlay}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          noWrap
        >
          {widgetTitle(definition, t)}
          {showScopeLabel && (
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              {scope.label}
            </Typography>
          )}
        </Typography>
      </Box>
      <Divider light />
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>{body}</Box>
    </Paper>
  )
}

/**
 * Stretch the widget's own card (a Section: Grid item > Paper) to the full
 * cell, so a short widget is a full-height card, not a small card above an
 * empty gap.
 */
const SELF_CHROME_GROW = {
  "& > .MuiGrid-item": {
    flex: "1 0 auto",
    display: "flex",
    flexDirection: "column",
  },
  "& > .MuiGrid-item > .MuiPaper-root": { flex: "1 0 auto" },
} as const

/**
 * In a fixed-size grid cell the card is instead sized to the cell exactly and
 * its content scrolls inside the card, vertically and horizontally. Table
 * widgets (offers, assignments, notifications) are often taller than a saved
 * layout's height and wider than a narrow grid column; before this the card
 * ran past the cell's bottom edge (the cell scrolled, so the card looked cut
 * off with no bottom border) and spilled sideways under ~600px. The card's
 * inner layout is left alone.
 */
const SELF_CHROME_FIT_CELL = {
  "& > .MuiGrid-item": {
    flex: "1 1 0",
    minHeight: 0,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  "& > .MuiGrid-item > .MuiPaper-root": {
    flex: "1 1 0",
    minHeight: 0,
    minWidth: 0,
    overflow: "auto",
  },
} as const

interface AggregateWidgetProps {
  aggregate: "all_orgs" | "all_shops"
  definition: WidgetDefinition
  settings?: DashboardWidget["settings"]
  t: TFunction
}

/**
 * Renders one instance of the widget per target (each org / each shop). Each
 * target is a separately-rendered child, so the widgets' internal data hooks run
 * correctly. A header labels each section.
 */
function AggregateWidget({
  aggregate,
  definition,
  settings,
  t,
}: AggregateWidgetProps) {
  const targets = useAggregateTargets(aggregate)

  if (targets.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        {aggregate === "all_orgs"
          ? t(
              "dashboard.noOrgsToAggregate",
              "You have no organizations to aggregate yet.",
            )
          : t(
              "dashboard.noShopsToAggregate",
              "You have no shops to aggregate yet.",
            )}
      </Alert>
    )
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {targets.map((target, index) => (
        <Box key={target.key}>
          {index > 0 && <Divider sx={{ mb: 2 }} />}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            {target.label}
          </Typography>
          {definition.render({ scope: target, settings, t })}
        </Box>
      ))}
    </Box>
  )
}
