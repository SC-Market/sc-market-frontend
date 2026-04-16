import { Typography, Box } from "@mui/material"
import { Page } from "../../../components/metadata/Page"
import { useTranslation } from "react-i18next"

/**
 * MarketPageV2 — Placeholder
 *
 * This is the V2 market page entry point. Implementation components
 * (ListingSearchV2, ListingDetailV2, etc.) should be added here.
 */
export function MarketPageV2() {
  const { t } = useTranslation()

  return (
    <Page title={t("market.market")} dontUseDefaultCanonUrl={true}>
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Market V2</Typography>
        <Typography color="text.secondary">
          V2 scaffolding is ready. Implementation components go here.
        </Typography>
      </Box>
    </Page>
  )
}
