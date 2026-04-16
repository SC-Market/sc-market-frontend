import React from "react"
import { Box, Typography } from "@mui/material"
import { Page } from "../../../components/metadata/Page"
import { useTranslation } from "react-i18next"

/**
 * MarketPageV2 - V2 market experience component
 * 
 * This is a placeholder component for the V2 market system.
 * It will be implemented with the new unified listing model,
 * variant system, and quality tier support.
 * 
 * TODO: Implement full V2 market experience with:
 * - Listing search with quality filters
 * - Variant breakdown display
 * - Per-variant pricing
 * - Quality tier filtering
 */
export function MarketPageV2() {
  const { t } = useTranslation()

  return (
    <Page title={t("market.market")} dontUseDefaultCanonUrl={true}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        p={4}
      >
        <Typography variant="h4" gutterBottom>
          Market V2 (Beta)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The V2 market experience is under development.
        </Typography>
      </Box>
    </Page>
  )
}
