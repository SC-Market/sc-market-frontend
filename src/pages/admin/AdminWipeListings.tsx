import React from "react"
import { useTranslation } from "react-i18next"
import { Grid, Typography } from "@mui/material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExpireAllListingsButton } from "../../views/admin/ExpireAllListingsButton"

export function AdminWipeListings() {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      title={t("adminUi.wipeListings.title")}
      headerTitle={t("adminUi.wipeListings.title")}
      maxWidth="sm"
    >
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {t("adminUi.wipeListings.description")}
        </Typography>
        <ExpireAllListingsButton />
      </Grid>
    </StandardPageLayout>
  )
}
