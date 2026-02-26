import React, { useEffect, useState, Suspense } from "react"
import { Box, Container, Divider, Grid, Paper, Stack, Typography, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Page } from "../../../components/metadata/Page"
import { OpenLayout } from "../../../components/layout/ContainerGrid"
import { BuyOrderActions } from "../../market/components/MarketActions"
import { HideOnScroll } from "../../market/components/MarketNavArea"
import { MarketNavArea } from "../../market/components/MarketNavArea"
import { MarketSidebar } from "../../market/components/MarketSidebar"
import { MarketSidebarContext, useMarketSearch } from "../../market"
import { useTranslation } from "react-i18next"
import { BuyOrders } from "../../market/listings"

function MarketTabLoader() {
  return null
}

export function BuyOrderItemsPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const theme = useTheme<ExtendedTheme>()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))

  const [marketSearch, setMarketSearch] = useMarketSearch()
  useEffect(() => {
    setMarketSearch({
      ...marketSearch,
      quantityAvailable: 0,
      sort: marketSearch.sort || "activity",
    })
  }, [])

  return (
    <Page title={t("market.buyOrders")}>
      <MarketSidebarContext.Provider value={[open, setOpen]}>
        {showMobileSidebar && <MarketSidebar showViewModeSelector />}

        <OpenLayout sidebarOpen={true} noMobilePadding={true}>
          {/* Header: same structure as MarketPage (title + actions, no tabs) */}
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
              spacing={{ xs: theme.layoutSpacing.component, sm: theme.layoutSpacing.layout }}
              sx={{ marginBottom: { xs: 2, sm: 4 } }}
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item xs={12} sm="auto">
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2.125rem" },
                  }}
                  color="text.secondary"
                >
                  {t("market.buyOrders")}
                </Typography>
              </Grid>
              <Grid item xs={12} sm="auto" sx={{ display: "flex", justifyContent: { xs: "stretch", sm: "flex-end" } }}>
                <BuyOrderActions />
              </Grid>
            </Grid>
            <Divider light sx={{ mt: 2, mb: 2 }} />
          </Container>

          {/* Content: same as ItemMarketView – Container xxxl, sidebar + listings */}
          <Container maxWidth="xxxl" sx={{ padding: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {showMobileSidebar ? (
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <Grid item xs={12}>
                    <HideOnScroll>
                      <MarketNavArea />
                    </HideOnScroll>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider light />
                  </Grid>
                  <Grid item xs={12}>
                    <Suspense fallback={<MarketTabLoader />}>
                      <BuyOrders />
                    </Suspense>
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
                      position: "sticky",
                      top: "calc(64px + 16px)",
                      maxHeight: "calc(100vh - 64px - 32px)",
                      height: "fit-content",
                      width: 300,
                      flexShrink: 0,
                      overflowY: "auto",
                    }}
                  >
                    <MarketSidebar showViewModeSelector />
                  </Paper>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Suspense fallback={<MarketTabLoader />}>
                      <BuyOrders />
                    </Suspense>
                  </Box>
                </Stack>
              )}
            </Box>
          </Container>
        </OpenLayout>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
