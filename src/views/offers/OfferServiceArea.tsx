import { OfferSession } from "../../store/offer"
import React from "react"
import { Grid, Paper, Typography } from "@mui/material"
import { ServiceListingBase } from "../../views/contracts/ServiceListings.lazy"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function OfferServiceArea(props: { offer: OfferSession }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { offer: session } = props

  if (session.offers[0].service) {
    return (
      <Grid item xs={12} lg={4} md={12}>
        <Paper sx={{ padding: 2 }}>
          <Stack spacing={theme.layoutSpacing.compact}>
            <Typography
              variant={"h5"}
              sx={{ fontWeight: "bold" }}
              color={"text.secondary"}
            >
              {t("OfferServiceArea.associatedServices")}
            </Typography>
            <ServiceListingBase service={session.offers[0].service} index={0} />
          </Stack>
        </Paper>
      </Grid>
    )
  } else {
    return (
      <Grid item xs={12} lg={4} md={12}>
        <Paper sx={{ padding: 2 }}>
          <Stack spacing={theme.layoutSpacing.compact}>
            <Typography
              variant={"h5"}
              sx={{ fontWeight: "bold" }}
              color={"text.secondary"}
            >
              {t("OfferServiceArea.associatedServices")}
            </Typography>
            <Typography variant={"subtitle2"}>
              {t("OfferServiceArea.noAssociatedServices")}
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    )
  }
}
