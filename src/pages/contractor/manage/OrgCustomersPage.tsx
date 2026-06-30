import { Alert, Grid } from "@mui/material"

export function OrgCustomersPage() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info">
          Customers are now tracked per-shop. View customers from each shop's management page.
        </Alert>
      </Grid>
    </Grid>
  )
}
