import React from "react"
import { Box, Grid, Skeleton, Tab, Tabs } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

/**
 * Skeleton component for OrgManage page
 * Matches the layout structure with tabs and content area
 */
export function OrgManageSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      <Grid item xs={12}>
        <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
          <Tabs value={0} variant="scrollable">
            <Tab label={<Skeleton width={80} />} />
            <Tab label={<Skeleton width={80} />} />
            <Tab label={<Skeleton width={80} />} />
            <Tab label={<Skeleton width={80} />} />
            <Tab label={<Skeleton width={80} />} />
          </Tabs>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing?.layout || 2}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={150} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={150} />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
