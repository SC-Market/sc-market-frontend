import { Box, Container, Divider, Grid, Skeleton, Stack } from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ContractorSkeleton } from "./ContractorSkeleton"
import { StandardPageLayout } from "../layout/StandardPageLayout"
import { SidebarPageMobileBody } from "../layout/SidebarPageLayout"

/** Cards the /contractors page shows while a page of orgs loads. */
export const CONTRACTORS_LOADING_CARD_COUNT = 10

/**
 * The /contractors results while loading: the page renders this, and so does
 * the mobile route skeleton, so the two are the same height.
 */
export function ContractorCardsSkeleton(props: { count?: number }) {
  const { count = CONTRACTORS_LOADING_CARD_COUNT } = props
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} key={i}>
          <ContractorSkeleton />
        </Grid>
      ))}
    </Grid>
  )
}

/**
 * Skeleton for contractors list page.
 * Wraps in StandardPageLayout for identical header, then matches
 * SidebarPageLayout structure: sidebar + content area.
 */
export function ContractorsListSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()

  if (isMobile) {
    // The page's mobile layout: the inline search field (ContractorSidebar),
    // a divider, then the loading cards and the pagination row.
    return (
      <StandardPageLayout title="Contractors" headerTitle="Contractors" maxWidth="xxl">
        <SidebarPageMobileBody
          sidebar={
            <Grid item xs={12}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          }
        >
          <ContractorCardsSkeleton />
          <Divider light sx={{ mt: 2 }} />
          <Skeleton variant="rectangular" height={52} sx={{ mt: 2 }} />
        </SidebarPageMobileBody>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout title="Contractors" headerTitle="Contractors" maxWidth="xxl">
      <Container maxWidth="xxl" sx={{ padding: 0, paddingTop: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Stack
            direction="row"
            justifyContent="center"
            spacing={theme.layoutSpacing.layout}
            sx={{ width: "100%", maxWidth: "xxl" }}
          >
            {/* Sidebar skeleton */}
            <Box sx={{ width: 280, flexShrink: 0 }}>
              <Skeleton variant="text" width={140} height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1, mb: 1 }} />
              ))}
              <Skeleton variant="text" width={80} height={24} sx={{ mt: 2, mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Content area */}
            <Box sx={{ flex: 1, maxWidth: "md" }}>
              <ContractorCardsSkeleton count={6} />
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Skeleton variant="rectangular" width={350} height={48} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </Stack>
        </Box>
      </Container>
    </StandardPageLayout>
  )
}
