import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { CustomerList } from "../../../views/people/Customers"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function OrgCustomersPage() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <CustomerList />
    </Grid>
  )
}
