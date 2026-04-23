/**
 * Skeleton loading states for game data pages.
 * Match the layout of the actual content for smooth transitions.
 */

import React from "react"
import { Box, Skeleton, Stack, Grid2 as Grid } from "@mui/material"

/** Skeleton for a mission/blueprint detail modal or page */
export function DetailSkeleton() {
  return (
    <Stack spacing={2}>
      {/* Header chips */}
      <Stack direction="row" spacing={0.5}>
        <Skeleton variant="rounded" width={60} height={22} />
        <Skeleton variant="rounded" width={80} height={22} />
        <Skeleton variant="rounded" width={55} height={22} />
      </Stack>
      {/* Tabs */}
      <Skeleton variant="rounded" width="100%" height={36} />
      {/* Description */}
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="70%" />
      {/* Reward rows */}
      <Skeleton variant="rounded" width="100%" height={1} />
      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between">
          <Skeleton variant="text" width={60} />
          <Skeleton variant="text" width={100} />
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={60} />
        </Stack>
      </Stack>
    </Stack>
  )
}

/** Skeleton for a grid of cards (missions, blueprints) */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Skeleton variant="rounded" height={180} sx={{ borderRadius: 1 }} />
        </Grid>
      ))}
    </Grid>
  )
}

/** Skeleton for a table of rows */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Stack spacing={0.5}>
      <Skeleton variant="rounded" width="100%" height={36} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" width="100%" height={32} />
      ))}
    </Stack>
  )
}

/** Skeleton for a detail page header (avatar + title + chips) */
export function DetailPageSkeleton() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="rounded" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Stack direction="row" spacing={0.5}>
            <Skeleton variant="rounded" width={50} height={20} />
            <Skeleton variant="rounded" width={70} height={20} />
            <Skeleton variant="rounded" width={40} height={20} />
          </Stack>
        </Box>
      </Stack>
      {/* Tabs */}
      <Skeleton variant="rounded" width="100%" height={40} />
      {/* Content area */}
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="95%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rounded" width="100%" height={1} />
      <Stack spacing={0.5}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Stack key={i} direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={100} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
