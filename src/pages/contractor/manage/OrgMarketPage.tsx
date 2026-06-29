import { Divider, Grid, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { MarketEditTemplate } from "../../../features/market"
import { ImportFromUex } from "../../../features/market/v2/ImportFromUex"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { usePageOrgManage } from "../../../features/contractor/hooks/usePageOrgManage"

export function OrgMarketPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data } = usePageOrgManage()
  const spectrumId = data?.contractor?.spectrum_id

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <MarketEditTemplate org contractorId={spectrumId} />
      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          {t("org.importFromUex", "Import from UEX")}
        </Typography>
        <ImportFromUex />
      </Grid>
    </Grid>
  )
}
