import React from "react"
import { Grid2, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"

export function LandingFeatures() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid2
      container
      justifyContent={"center"}
      spacing={theme.layoutSpacing.layout * 4}
    >
      <Grid2 size={{ xs: 12, md: 4 }}>
        <Stack direction={"column"}>
          <Typography
            variant={"h4"}
            sx={{ fontWeight: "bold", textAlign: "center" }}
            color={"text.secondary"}
          >
            {t("landing.buySellItemsTitle")}
          </Typography>
          <Typography
            variant={"body1"}
            sx={{ textAlign: "left" }}
            color={"text.secondary"}
          >
            {t("landing.buySellItemsText")}
          </Typography>
        </Stack>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <Stack direction={"column"}>
          <Typography
            variant={"h4"}
            sx={{ fontWeight: "bold", textAlign: "center" }}
            color={"text.secondary"}
          >
            {t("landing.tradeInBulkTitle")}
          </Typography>
          <Typography
            variant={"body1"}
            sx={{ textAlign: "left" }}
            color={"text.secondary"}
          >
            {t("landing.tradeInBulkText")}
          </Typography>
        </Stack>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <Stack direction={"column"}>
          <Typography
            variant={"h4"}
            sx={{ fontWeight: "bold", textAlign: "center" }}
            color={"text.secondary"}
          >
            {t("landing.orderServicesTitle")}
          </Typography>
          <Typography
            variant={"body1"}
            sx={{ textAlign: "left" }}
            color={"text.secondary"}
          >
            {t("landing.orderServicesText")}
          </Typography>
        </Stack>
      </Grid2>
    </Grid2>
  )
}
