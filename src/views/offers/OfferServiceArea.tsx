import React from "react"
import { Grid, Paper, Typography, Link as MuiLink } from "@mui/material"
import { Link } from "react-router-dom"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface OfferServiceAreaProps {
  /** V2 session */
  session?: { offers: Array<{ service?: { service_id: string; title: string } | null }> }
  /** V1 compat — alias for session */
  offer?: { offers: Array<{ service?: { service_id: string; title: string } | null }> }
}

export function OfferServiceArea(props: OfferServiceAreaProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const session = props.session || props.offer

  const service = session?.offers[0]?.service
  return (
    <Grid item xs={12} lg={4} md={12}>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={theme.layoutSpacing.compact}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} color="text.secondary">
            {t("OfferServiceArea.associatedServices")}
          </Typography>
          {service ? (
            <MuiLink
              component={Link}
              to={`/services/${service.service_id}`}
              underline="hover"
              color="text.secondary"
            >
              {service.title}
            </MuiLink>
          ) : (
            <Typography variant="subtitle2">
              {t("OfferServiceArea.noAssociatedServices")}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Grid>
  )
}
