import { Grid, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { MarketEditTemplate } from "../../../features/market"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { usePageOrgManage } from "../../../features/contractor/hooks/usePageOrgManage"
import { Alert } from "@mui/material"

export function OrgMarketPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data } = usePageOrgManage()
  const spectrumId = data?.contractor?.spectrum_id

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <MarketEditTemplate org contractorId={spectrumId} />
      <Grid item xs={12}>
        <Alert severity="info">
          Listing imports and management are now done from each shop's settings page.
        </Alert>
      </Grid>
    </Grid>
  )
}
