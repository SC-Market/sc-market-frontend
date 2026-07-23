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
}

export function WidgetWrapper({ widget, editing, onRemove }: WidgetWrapperProps) {
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
