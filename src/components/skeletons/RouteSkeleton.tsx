import { Box, Container, Divider, Grid, Paper, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { BaseSkeleton } from "./BaseSkeleton"
import { CardSkeleton } from "./CardSkeleton"
import { TableSkeleton } from "./TableSkeleton"
import { ListingSkeleton } from "./ListingSkeleton"
import { OpenLayout } from "../layout/ContainerGrid"
import type { ExtendedTheme } from "../../hooks/styles/Theme"

/**
 * Generic page skeleton with header and content area
 */
export function PageSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="40%" height={40} />
        <BaseSkeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
      </Box>
      <BaseSkeleton variant="rectangular" width="100%" height={400} />
    </Container>
  )
}

const LISTING_GRID_BREAKPOINTS = {
  xs: 6,
  sm: 4,
  md: 4,
  lg: 3,
  xl: 2.4,
  xxl: 2,
  xxxl: 12 / 8,
} as const

/**
 * Market page skeleton – matches MarketPage + ItemMarketView layout (OpenLayout, xxl/xxxl, sidebar + listings grid)
 */
export function MarketPageSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))

  return (
    <OpenLayout sidebarOpen={true} noMobilePadding={true}>
      {/* Header: same as MarketPage – Container xxl, title + tabs + actions */}
      <Container
        maxWidth="xxl"
        sx={{
          paddingTop: { xs: 2, sm: 8 },
          paddingX: { xs: theme.spacing(1), sm: theme.spacing(3) },
          marginX: "auto",
        }}
      >
        <Grid
          container
          spacing={{
            xs: theme.layoutSpacing.component,
            sm: theme.layoutSpacing.layout,
          }}
          sx={{ marginBottom: { xs: 2, sm: 4 } }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} sm="auto">
            <BaseSkeleton
              variant="text"
              width={160}
              height={34}
              sx={{ fontSize: "2.125rem" }}
            />
          </Grid>
          <Grid item xs={12} sm="auto">
            <BaseSkeleton
              variant="rectangular"
              width={320}
              height={64}
              sx={{ borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm="auto">
            <BaseSkeleton variant="rectangular" width={120} height={40} />
          </Grid>
        </Grid>
        <Divider light sx={{ mt: 2, mb: 2 }} />
      </Container>

      {/* Content: same as ItemMarketView – Container xxxl, sidebar + listings grid */}
      <Container maxWidth="xxxl" sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <BaseSkeleton variant="rectangular" height={64} />
              </Grid>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1} sx={{ width: "100%" }}>
                  {[...Array(12)].map((_, i) => (
                    <Grid item key={i} {...LISTING_GRID_BREAKPOINTS}>
                      <ListingSkeleton index={i} sidebarOpen={false} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              <Paper
                sx={{
                  width: 300,
                  flexShrink: 0,
                  height: 400,
                  overflow: "hidden",
                }}
              >
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <BaseSkeleton variant="rectangular" height={40} />
                  <BaseSkeleton variant="rectangular" height={56} />
                  <BaseSkeleton variant="rectangular" height={56} />
                  <BaseSkeleton variant="rectangular" height={56} />
                </Box>
              </Paper>
              <Box sx={{ flex: 1 }}>
                <Grid container spacing={1} sx={{ width: "100%" }}>
                  {[...Array(16)].map((_, i) => (
                    <Grid item key={i} {...LISTING_GRID_BREAKPOINTS}>
                      <ListingSkeleton index={i} sidebarOpen={false} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </OpenLayout>
  )
}

/**
 * Dashboard skeleton with cards and stats
 */
export function DashboardSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
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
    </Container>
  )
}

/**
 * Profile page skeleton
 */
export function ProfileSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
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
    </Container>
  )
}

/**
 * List page skeleton with table
 */
export function ListPageSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <BaseSkeleton variant="text" width="30%" height={40} />
        <BaseSkeleton variant="rectangular" width={120} height={40} />
      </Box>
      <TableSkeleton rows={10} columns={5} />
    </Container>
  )
}

/**
 * Detail page skeleton
 */
export function DetailPageSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
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
    </Container>
  )
}

/**
 * Form page skeleton
 */
export function FormPageSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
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
    </Container>
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
