import React, { Suspense, useState } from "react"
import { CircularProgress, Box, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Page } from "../../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import { MarketV2Routes } from "../../../features/market/v2/MarketV2Routes"
import { MarketSidebarContext } from "../../../features/market/hooks/MarketSidebar"

function MarketV2LoadingFallback() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"
    >
      <CircularProgress />
    </Box>
  )
}

export function MarketPageV2() {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  return (
    <Page title={t("market.market")} dontUseDefaultCanonUrl={true}>
      <MarketSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
        <Suspense fallback={<MarketV2LoadingFallback />}>
          <MarketV2Routes />
        </Suspense>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
