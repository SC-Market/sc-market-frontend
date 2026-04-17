import React, { Suspense } from "react"
import { CircularProgress, Box } from "@mui/material"
import { Page } from "../../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import { MarketV2Routes } from "../../../features/market/v2/MarketV2Routes"

/**
 * Loading fallback for lazy-loaded V2 components
 */
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

/**
 * MarketPageV2 - Entry point for Market V2
 *
 * This component wraps the V2 routing system and provides
 * the page metadata and suspense boundary for lazy-loaded components.
 */
export function MarketPageV2() {
  const { t } = useTranslation()

  return (
    <Page title={t("market.market")} dontUseDefaultCanonUrl={true}>
      <Suspense fallback={<MarketV2LoadingFallback />}>
        <MarketV2Routes />
      </Suspense>
    </Page>
  )
}
