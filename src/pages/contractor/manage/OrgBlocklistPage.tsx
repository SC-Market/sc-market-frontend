import { Alert, Grid } from "@mui/material"

export function OrgBlocklistPage() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info">
          The blocklist is now managed per-shop. Go to each shop's settings to manage blocked users.
        </Alert>
      </Grid>
    </Grid>
  )
}
