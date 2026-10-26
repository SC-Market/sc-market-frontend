import { Box, Container, Divider, Grid, Paper, Stack } from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { ServiceSidebar } from "../contracts/ServiceSidebar"
import { ServiceListings } from "../contracts/ServiceListings.lazy"
import { useServiceSidebar } from "../../features/contracting/hooks/ServiceSidebar"
import React, { Suspense } from "react"
import { MARKET_FILTER_PANEL_SX } from "../../components/layout/MarketPageLayout"
import { ServiceListingsSkeleton } from "../../components/skeletons/MarketSearchSkeleton"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ServiceSearchArea } from "./ServiceSearchArea"
import { PageBusy } from "../../components/metadata/PageReady"

export function ServiceMarketView() {
  const theme = useTheme<ExtendedTheme>()
  const xs = useIsMobile()
  const [open] = useServiceSidebar()

  return (
    <>
      {xs && <ServiceSidebar />}
      <Container maxWidth={"xxl"} sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {xs ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                <Grid
                  container
                  spacing={theme.layoutSpacing.layout}
                  justifyContent={"center"}
                >
                  <Suspense
                    fallback={
                      <>
                        <PageBusy />
                        <ServiceListingsSkeleton />
                      </>
                    }
                  >
                    <ServiceListings />
                  </Suspense>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxl" }}
            >
              <Paper sx={MARKET_FILTER_PANEL_SX}>
                <ServiceSearchArea />
              </Paper>

              <Box sx={{ flex: 1 }}>
                <Grid
                  container
                  spacing={theme.layoutSpacing.layout}
                  justifyContent={"center"}
                >
                  <Suspense
                    fallback={
                      <>
                        <PageBusy />
                        <ServiceListingsSkeleton />
                      </>
                    }
                  >
                    <ServiceListings />
                  </Suspense>
                </Grid>
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}
