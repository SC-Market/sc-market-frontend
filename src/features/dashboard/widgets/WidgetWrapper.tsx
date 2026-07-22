/**
 * WidgetWrapper — common chrome around each dashboard widget: a drag handle,
 * title (with resolved scope label), an optional remove control, and the
 * scope-resolution / unavailable / aggregate placeholder states.
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

  return (
    <Paper
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {editing && (
          <Box
            className="dashboard-widget-drag-handle"
            sx={{ cursor: "move", display: "flex", color: "text.secondary" }}
          >
            <DragIndicatorIcon fontSize="small" />
          </Box>
        )}
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }} noWrap>
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
        {editing && onRemove && (
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

      <Box sx={{ flexGrow: 1, overflow: "auto", p: 1.5 }}>
        {scope.unavailable ? (
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
        )}
      </Box>
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
