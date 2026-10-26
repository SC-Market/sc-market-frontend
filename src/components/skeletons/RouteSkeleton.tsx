import React from "react"
import { Box, Grid } from "@mui/material"
import { ContainerGrid } from "../layout/ContainerGrid"
import { BaseSkeleton } from "./BaseSkeleton"
import { CardSkeleton } from "./CardSkeleton"
import { TableSkeleton } from "./TableSkeleton"

/**
 * Page frame of the generic route skeletons: the same scroll container,
 * navbar spacer and paddings as StandardPageLayout (ContainerGrid), but no
 * footer: a footer under a short skeleton would sit in view and then get
 * pushed down when the page arrives.
 */
function RouteFrame({
  maxWidth,
  children,
}: {
  maxWidth: "md" | "lg" | "xl"
  children: React.ReactNode
}) {
  return (
    <ContainerGrid sidebarOpen={true} maxWidth={maxWidth} noFooter>
      <Grid item xs={12}>
        {children}
      </Grid>
    </ContainerGrid>
  )
}

/**
 * Generic page skeleton with header and content area
 */
export function PageSkeleton() {
  return (
    <RouteFrame maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="40%" height={40} />
        <BaseSkeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
      </Box>
      <BaseSkeleton variant="rectangular" width="100%" height={400} />
    </RouteFrame>
  )
}

/**
 * Dashboard skeleton with cards and stats
 */
export function DashboardSkeleton() {
  return (
    <RouteFrame maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="40%" height={40} />
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <CardSkeleton height={120} />
          </Grid>
        ))}
      </Grid>

      {/* Main content area */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CardSkeleton height={400} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardSkeleton height={400} />
        </Grid>
      </Grid>
    </RouteFrame>
  )
}

/**
 * Profile page skeleton
 */
export function ProfileSkeleton() {
  return (
    <RouteFrame maxWidth="lg">
      {/* Header with avatar and info */}
      <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
        <BaseSkeleton variant="circular" width={120} height={120} />
        <Box sx={{ flex: 1 }}>
          <BaseSkeleton variant="text" width="40%" height={32} />
          <BaseSkeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
          <BaseSkeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <BaseSkeleton variant="rectangular" width="100%" height={48} />
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        {[...Array(3)].map((_, index) => (
          <Grid item xs={12} md={4} key={index}>
            <CardSkeleton height={200} />
          </Grid>
        ))}
      </Grid>
    </RouteFrame>
  )
}

/**
 * List page skeleton with table
 */
export function ListPageSkeleton() {
  return (
    <RouteFrame maxWidth="xl">
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <BaseSkeleton variant="text" width="30%" height={40} />
        <BaseSkeleton variant="rectangular" width={120} height={40} />
      </Box>
      <TableSkeleton rows={10} columns={5} />
    </RouteFrame>
  )
}

/**
 * Detail page skeleton
 */
export function DetailPageSkeleton() {
  return (
    <RouteFrame maxWidth="lg">
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        <BaseSkeleton variant="text" width="40%" height={24} />
      </Box>

      {/* Title */}
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="60%" height={40} />
        <BaseSkeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
      </Box>

      {/* Main content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CardSkeleton height={500} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CardSkeleton height={200} />
            <CardSkeleton height={150} />
          </Box>
        </Grid>
      </Grid>
    </RouteFrame>
  )
}

/**
 * Form page skeleton
 */
export function FormPageSkeleton() {
  return (
    <RouteFrame maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="50%" height={40} />
        <BaseSkeleton variant="text" width="70%" height={24} sx={{ mt: 1 }} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[...Array(5)].map((_, index) => (
          <Box key={index}>
            <BaseSkeleton
              variant="text"
              width="30%"
              height={24}
              sx={{ mb: 1 }}
            />
            <BaseSkeleton variant="rectangular" width="100%" height={56} />
          </Box>
        ))}

        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
        >
          <BaseSkeleton variant="rectangular" width={100} height={40} />
          <BaseSkeleton variant="rectangular" width={100} height={40} />
        </Box>
      </Box>
    </RouteFrame>
  )
}

/**
 * Admin page skeleton with sidebar
 */
export function AdminPageSkeleton() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, p: 2, borderRight: 1, borderColor: "divider" }}>
        <BaseSkeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
        {[...Array(6)].map((_, index) => (
          <BaseSkeleton
            key={index}
            variant="rectangular"
            width="100%"
            height={40}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <BaseSkeleton variant="text" width="40%" height={40} />
        </Box>
        <TableSkeleton rows={15} columns={6} />
      </Box>
    </Box>
  )
}
