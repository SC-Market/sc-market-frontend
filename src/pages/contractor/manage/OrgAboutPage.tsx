import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { OrgDetailEdit } from "../../../views/contractor/OrgManage"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function OrgAboutPage() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <OrgDetailEdit />
    </Grid>
  )
}
