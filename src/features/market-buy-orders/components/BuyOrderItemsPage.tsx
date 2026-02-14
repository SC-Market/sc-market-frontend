import React, { useEffect, useState, Suspense } from "react"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../../components/layout/ContainerGrid"
import { Box, Grid, Divider, Paper, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Page } from "../../../components/metadata/Page"
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
  const xs = useMediaQuery(theme.breakpoints.down("md"))

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
        {xs && <MarketSidebar />}
        
        <ContainerGrid maxWidth={"xl"} sidebarOpen={false}>
          <Grid
            container
            spacing={theme.layoutSpacing.layout}
            justifyContent={"center"}
          >
            {xs && (
              <>
                <Grid item xs={12}>
                  <HideOnScroll>
                    <MarketNavArea />
                  </HideOnScroll>
                </Grid>

                <Grid item xs={12}>
                  <Divider light />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Grid
                container
                justifyContent={"space-between"}
                spacing={theme.layoutSpacing.compact}
              >
                <HeaderTitle lg={7} xl={7}>
                  {t("market.buyOrders")}
                </HeaderTitle>

                <BuyOrderActions />
              </Grid>
            </Grid>

            {!xs && (
              <Grid item xs={12} md="auto">
                <Paper
                  sx={{
                    position: "sticky",
                    top: theme.spacing(2),
                    maxHeight: `calc(100vh - ${theme.spacing(4)})`,
                    width: 300,
                    flexShrink: 0,
                    overflowY: "auto",
                  }}
                >
                  <MarketSidebar />
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} md sx={{ transition: "all 0.3s ease" }}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  pb: 3,
                }}
              >
                <Suspense fallback={<MarketTabLoader />}>
                  <BuyOrders />
                </Suspense>
              </Box>
            </Grid>
          </Grid>
        </ContainerGrid>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
