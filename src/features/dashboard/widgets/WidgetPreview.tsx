/**
 * WidgetPreview — a lightweight schematic of a widget's layout for the
 * add-widget gallery. It draws greyed-out placeholder shapes (bars, a chart
 * line, table rows, list rows, cards) rather than resolving live data, so the
 * user can recognize a widget's shape at a glance before adding it.
 *
 * Because several widgets share a schematic `kind` (e.g. multiple tables), each
 * definition also carries a distinct icon, shown as a chip in the corner so the
 * schematics stay distinguishable at a glance.
 */

import { Box } from "@mui/material"
import type { SvgIconComponent } from "@mui/icons-material"
import type { WidgetPreviewKind } from "./registry"

const BAR = "action.hover"
const ACCENT = "action.selected"

/** A single greyed placeholder block. */
function Bar({
  w = "100%",
  h = 8,
  color = BAR,
}: {
  w?: number | string
  h?: number
  color?: string
}) {
  return (
    <Box
      sx={{ width: w, height: h, borderRadius: 0.5, bgcolor: color, flexShrink: 0 }}
    />
  )
}

export function WidgetPreview({
  kind,
  icon: Icon,
}: {
  kind: WidgetPreviewKind
  icon?: SvgIconComponent
}) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        height: 72,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.default",
        p: 1,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        overflow: "hidden",
      }}
    >
      {Icon && (
        <Box
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: "background.paper",
            color: "primary.main",
            boxShadow: 1,
          }}
        >
          <Icon sx={{ fontSize: 15 }} />
        </Box>
      )}
      {kind === "metrics" && (
        <Box sx={{ display: "flex", gap: 1, height: "100%" }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <Bar w="60%" h={12} color={ACCENT} />
              <Bar w="80%" h={6} />
            </Box>
          ))}
        </Box>
      )}

      {kind === "chart" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 0.75,
            height: "100%",
          }}
        >
          {[40, 65, 30, 80, 55, 70].map((h, i) => (
            <Bar key={i} w="100%" h={(h / 100) * 56} color={ACCENT} />
          ))}
        </Box>
      )}

      {kind === "table" && (
        <>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Bar w="40%" h={7} color={ACCENT} />
            <Bar w="25%" h={7} color={ACCENT} />
            <Bar w="20%" h={7} color={ACCENT} />
          </Box>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1 }}>
              <Bar w="40%" />
              <Bar w="25%" />
              <Bar w="20%" />
            </Box>
          ))}
        </>
      )}

      {kind === "list" && (
        <>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: ACCENT,
                  flexShrink: 0,
                }}
              />
              <Bar w={`${80 - i * 15}%`} />
            </Box>
          ))}
        </>
      )}

      {kind === "cards" && (
        <Box sx={{ display: "flex", gap: 1, height: "100%" }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Bar w="100%" h={30} color={ACCENT} />
              <Bar w="90%" h={5} />
              <Bar w="60%" h={5} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
