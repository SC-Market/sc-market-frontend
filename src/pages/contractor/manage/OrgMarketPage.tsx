import { Alert, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function OrgMarketPage() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12}>
        <Alert severity="info">
          Market settings are now managed per-shop. Go to your shop's settings page.
        </Alert>
      </Grid>
    </Grid>
  )
}
