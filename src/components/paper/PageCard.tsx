import React, { useId } from "react"
import { Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material"

/**
 * The one card of a single-purpose page (a link from an email or a DM:
 * unsubscribe, email verification, "Still selling?", Discord install). Put
 * it in a StandardPageLayout with maxWidth="sm": the page keeps the app's
 * top bar and sidebar, and its content sits on a Paper surface with a real
 * page heading (h1) instead of floating text on the background.
 */
export function PageCard(props: {
  /** The page heading (rendered as the page's h1). */
  title: React.ReactNode
  /** A status icon shown before the title (sized to the title). */
  icon?: React.ReactNode
  children: React.ReactNode
  "data-testid"?: string
}) {
  const titleId = useId()
  return (
    <Grid item xs={12}>
      <Paper
        component="section"
        aria-labelledby={titleId}
        data-testid={props["data-testid"]}
        sx={{ width: "100%", overflow: "hidden" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: { xs: 2, sm: 3 },
            py: 2,
            "& > svg": { fontSize: 32, flexShrink: 0 },
          }}
        >
          {props.icon}
          <Typography
            id={titleId}
            variant="h5"
            component="h1"
            color="text.secondary"
            sx={{ fontWeight: "bold" }}
          >
            {props.title}
          </Typography>
        </Box>
        <Divider light />
        <Stack spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          {props.children}
        </Stack>
      </Paper>
    </Grid>
  )
}

/** The buttons row at the bottom of a PageCard (stacks on a phone). */
export function PageCardActions(props: { children: React.ReactNode }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ pt: 1, "& > *": { width: { xs: "100%", sm: "auto" } } }}
    >
      {props.children}
    </Stack>
  )
}
