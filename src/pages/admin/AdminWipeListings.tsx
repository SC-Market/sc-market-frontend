import React from "react"
import { Grid, Typography } from "@mui/material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExpireAllListingsButton } from "../../views/admin/ExpireAllListingsButton"

export function AdminWipeListings() {
  return (
    <StandardPageLayout
      title="Wipe Listings"
      headerTitle="Wipe Listings"
      maxWidth="sm"
    >
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Expire all active listings after a game wipe. Sellers see them as
          paused, and bring back the ones they still sell from their shop&apos;s
          Listings page (the renew button, or select them and Activate). Nothing
          is deleted.
        </Typography>
        <ExpireAllListingsButton />
      </Grid>
    </StandardPageLayout>
  )
}
