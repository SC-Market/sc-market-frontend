import React from "react"
import { Box, Link, Paper, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import type { MissionHubFactRow } from "../../../seo/missionHubs"

/** The aside's facts panel (seo/missionHubs.ts missionHubFactRows) as a <dl>. */
export function HubFacts({
  title,
  rows,
}: {
  title: string
  rows: MissionHubFactRow[]
}) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby="hub-facts">
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Typography
          id="hub-facts"
          component="h2"
          color="text.secondary"
          sx={{ fontSize: 17, fontWeight: 500, m: 0 }}
        >
          {title}
        </Typography>
      </Box>
      <Box component="dl" sx={{ m: 0, pb: 0.5 }}>
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "110px 1fr", md: "118px 1fr" },
              gap: 1.25,
              px: 2,
              py: 1,
              borderTop: 1,
              borderColor: "divider",
              fontSize: 14,
            }}
          >
            <Box component="dt" sx={{ color: "text.primary" }}>
              {row.label}
            </Box>
            <Box
              component="dd"
              sx={{ m: 0, color: "text.secondary", minWidth: 0 }}
            >
              {row.items.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && ", "}
                  {item.href ? (
                    <Link
                      component={RouterLink}
                      to={item.href}
                      color="inherit"
                      sx={{
                        textUnderlineOffset: "3px",
                        textDecorationColor: "rgba(255,255,255,0.3)",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {item.text}
                    </Link>
                  ) : (
                    item.text
                  )}
                  {item.note && (
                    <Box component="span" sx={{ color: "text.primary" }}>
                      {" "}
                      {item.note}
                    </Box>
                  )}
                </React.Fragment>
              ))}
              {row.note && (
                <Box
                  component="span"
                  sx={{ display: "block", color: "text.primary" }}
                >
                  {row.note}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
