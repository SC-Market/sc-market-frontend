import React from "react"
import { Box, Grid } from "@mui/material"
import { ContainerGrid } from "../layout/ContainerGrid"
import { PageHeaderRowSkeleton } from "../layout/StandardPageLayout"
import { BaseSkeleton } from "./BaseSkeleton"
import { CardSkeleton } from "./CardSkeleton"
import { DataGridSkeleton } from "./DataGridSkeleton"
import { TableSkeleton } from "./TableSkeleton"

/**
 * Page frame of the generic route skeletons: StandardPageLayout's frame
 * (ContainerGrid: scroll container, navbar spacer, paddings and the spaced
 * grid its sections sit in) and its title row (PageHeaderRowSkeleton, the
 * real header row with a title-sized placeholder), so the content below
 * starts where the page's does. No footer: a footer under a short skeleton
 * would sit in view and then get pushed down when the page arrives.
 * Children are the page's grid items.
 */
function RouteFrame({
  maxWidth,
  title = "40%",
  children,
}: {
  /** StandardPageLayout's maxWidth for these pages (its default is lg) */
  maxWidth: "md" | "lg" | "xl"
  /** Width of the title placeholder; null for a page without a title row */
  title?: string | number | null
  children: React.ReactNode
}) {
  return (
    <ContainerGrid sidebarOpen={true} maxWidth={maxWidth} noFooter>
      {title !== null && <PageHeaderRowSkeleton width={title} />}
      {children}
    </ContainerGrid>
  )
}

/**
 * Generic page skeleton with header and content area
 */
export function PageSkeleton() {
  return (
    <RouteFrame maxWidth="xl">
      <Grid item xs={12}>
        <BaseSkeleton variant="rounded" width="100%" height={400} />
      </Grid>
    </RouteFrame>
  )
}

/**
 * Dashboard skeleton with cards and stats
 */
export function DashboardSkeleton() {
  return (
    <RouteFrame maxWidth="xl" title="30%">
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <CardSkeleton height={120} />
        </Grid>
      ))}
      <Grid item xs={12} md={8}>
        <CardSkeleton height={400} />
      </Grid>
      <Grid item xs={12} md={4}>
        <CardSkeleton height={400} />
      </Grid>
    </RouteFrame>
  )
}

/**
 * Profile page skeleton
 */
export function ProfileSkeleton() {
  return (
    <RouteFrame maxWidth="lg" title={null}>
      <Grid item xs={12}>
        <Box sx={{ display: "flex", gap: 3 }}>
          <BaseSkeleton variant="circular" width={120} height={120} />
          <Box sx={{ flex: 1 }}>
            <BaseSkeleton variant="text" width="40%" height={32} />
            <BaseSkeleton variant="text" width="60%" height={24} />
            <BaseSkeleton variant="text" width="50%" height={20} />
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <BaseSkeleton variant="rounded" width="100%" height={48} />
      </Grid>
      {[...Array(3)].map((_, index) => (
        <Grid item xs={12} md={4} key={index}>
          <CardSkeleton height={200} />
        </Grid>
      ))}
    </RouteFrame>
  )
}

/**
 * List page skeleton with table
 */
export function ListPageSkeleton() {
  return (
    <RouteFrame maxWidth="xl" title="30%">
      <Grid item xs={12}>
        <TableSkeleton rows={10} columns={5} />
      </Grid>
    </RouteFrame>
  )
}

/**
 * Detail page skeleton
 */
export function DetailPageSkeleton() {
  return (
    <RouteFrame maxWidth="lg" title="60%">
      <Grid item xs={12} md={8}>
        <CardSkeleton height={500} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <CardSkeleton height={200} />
          <CardSkeleton height={150} />
        </Box>
      </Grid>
    </RouteFrame>
  )
}

/**
 * Form page skeleton: FormPageLayout (maxWidth lg, the title row, fields,
 * the actions row at the end).
 */
export function FormPageSkeleton() {
  return (
    <RouteFrame maxWidth="lg" title="50%">
      <Grid item xs={12}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[...Array(5)].map((_, index) => (
            <Box key={index}>
              <BaseSkeleton
                variant="text"
                width="30%"
                height={24}
                sx={{ mb: 1 }}
              />
              <BaseSkeleton variant="rounded" width="100%" height={56} />
            </Box>
          ))}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <BaseSkeleton variant="rounded" width={100} height={36.5} />
            <BaseSkeleton variant="rounded" width={100} height={36.5} />
          </Box>
        </Box>
      </Grid>
    </RouteFrame>
  )
}

/**
 * Admin pages: StandardPageLayout (xl) with the title row over a DataGrid
 * (most admin views are one autoHeight grid). The app's own sidebar is
 * the only sidebar, so there is none here.
 */
export function AdminPageSkeleton() {
  return (
    <RouteFrame maxWidth="xl" title="30%">
      <Grid item xs={12}>
        <DataGridSkeleton rows={10} columns={6} />
      </Grid>
    </RouteFrame>
  )
}
