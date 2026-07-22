/**
 * WidgetWrapper — common chrome around each dashboard widget: a drag handle,
 * title (with resolved scope label), an optional remove control, and the
 * scope-resolution / unavailable / aggregate placeholder states.
 */

import { Alert, Box, IconButton, Paper, Tooltip, Typography } from "@mui/material"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import CloseIcon from "@mui/icons-material/Close"
import { useResolveScope } from "../useResolveScope"
import { getWidgetDefinition } from "./registry"
import type { DashboardWidget } from "../types"

export interface WidgetWrapperProps {
  widget: DashboardWidget
  editing: boolean
  onRemove?: (id: string) => void
}

export function WidgetWrapper({ widget, editing, onRemove }: WidgetWrapperProps) {
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
          {definition.title}
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
          <Tooltip title="Remove widget">
            <IconButton
              size="small"
              aria-label="Remove widget"
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
            This widget's {widget.scope.kind === "specific_shop" ? "shop" : "organization"} is no
            longer available. Remove it or pick a new scope.
          </Alert>
        ) : scope.aggregate ? (
          <Alert severity="info" variant="outlined">
            Aggregate scope ({scope.label}) is coming soon.
          </Alert>
        ) : (
          definition.render({ scope, settings: widget.settings })
        )}
      </Box>
    </Paper>
  )
}
