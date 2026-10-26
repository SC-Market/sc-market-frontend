import React from "react"
import { Box, Button, Grid2, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import recruitingCap from "../../assets/recruiting.webp"
import manageStockCap from "../../assets/manage-stock.webp"
import servicesCap from "../../assets/services-cap.webp"
import {
  LandingBlockTitle,
  LandingBodyText,
  LandingSectionTitle,
} from "./LandingTypography"

function LandingSmallImage(props: { src: string; title: string }) {
  const { src, title } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"column"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <img
        src={src}
        style={{
          width: "100%",
          aspectRatio: "1/1",
          border: `1px solid ${theme.palette.outline.main}`,
          marginBottom: theme.spacing(2),
          objectFit: "cover",
          borderRadius: theme.spacing(theme.borderRadius.button),
        }}
        alt={title}
        loading="lazy"
      />
      <LandingBlockTitle>{title}</LandingBlockTitle>
    </Stack>
  )
}

export function LandingOrgFeatures() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"column"}
      spacing={theme.spacing(8)}
      sx={{
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(13),
      }}
    >
      <Stack justifyContent={"center"} alignItems={"center"}>
        <LandingSectionTitle>
          SC Market
          <Box
            component={"span"}
            sx={{ display: "block", color: "secondary.main" }}
          >
            {t("landing.forOrgs")}
          </Box>
        </LandingSectionTitle>
      </Stack>

      <Grid2
        container
        justifyContent={"center"}
        spacing={theme.layoutSpacing.layout * 2}
      >
        <Grid2 size={{ xs: 12, md: 4 }}>
          <LandingSmallImage
            src={recruitingCap}
            title={t("landing.orgRecruitment")}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <LandingSmallImage
            src={servicesCap}
            title={t("landing.serviceListings")}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <LandingSmallImage
            src={manageStockCap}
            title={t("landing.stockManagement")}
          />
        </Grid2>
      </Grid2>

      <Stack
        direction={"column"}
        spacing={theme.spacing(8)}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <LandingBodyText sx={{ textAlign: "center" }}>
          {t("landing.orgsHelpText")}
        </LandingBodyText>
        <Button
          variant={"outlined"}
          color={"secondary"}
          href={`https://github.com/henry232323/sc-market/wiki`}
        >
          {t("landing.learnMore")}
        </Button>
      </Stack>
    </Stack>
  )
}
