import React from "react"
import { Box, Paper } from "@mui/material"
import type { HubStatTile } from "./hubModel"

/**
 * The hub's numbers as a row of tiles (a <dl>): label, figure, note. Tiles
 * without data aren't passed in (hubStatTiles), so empty ones never show.
 */
export function HubStatTiles({ tiles }: { tiles: HubStatTile[] }) {
  return (
    <Paper
      variant="outlined"
      component="dl"
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr 1fr",
          md: `repeat(${tiles.length}, minmax(0, 1fr))`,
        },
        m: 0,
        mb: 3,
        "& > div": {
          px: { xs: 1.5, md: 2.5 },
          py: 1.5,
          minWidth: 0,
          borderColor: "divider",
          borderStyle: "solid",
          borderWidth: 0,
          borderLeftWidth: { xs: 0, md: 1 },
          borderTopWidth: { xs: 1, md: 0 },
        },
        "& > div:first-of-type": { borderLeftWidth: 0 },
        "& > div:nth-of-type(-n+2)": { borderTopWidth: { xs: 0 } },
        "& > div:nth-of-type(even)": { borderLeftWidth: { xs: 1 } },
        "& > div:last-of-type:nth-of-type(odd)": {
          gridColumn: { xs: "1 / -1", md: "auto" },
        },
      }}
    >
      {tiles.map((tile) => (
        <div key={tile.key}>
          <Box
            component="dt"
            sx={{ fontSize: 13, color: "text.primary", m: 0, mb: 0.5 }}
          >
            {tile.label}
          </Box>
          <Box
            component="dd"
            sx={{
              m: 0,
              whiteSpace: "nowrap",
              fontSize: { xs: 20, md: 22 },
              lineHeight: 1.2,
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tile.value}
            {tile.note && (
              <Box
                component="small"
                sx={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "text.primary",
                  mt: 0.5,
                  whiteSpace: "normal",
                }}
              >
                {tile.note}
              </Box>
            )}
          </Box>
        </div>
      ))}
    </Paper>
  )
}
