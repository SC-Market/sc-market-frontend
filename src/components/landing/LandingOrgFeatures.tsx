import React from "react"
import { Box, Button, Grid2, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import recruitingCap from "../../assets/recruiting.webp"
import manageStockCap from "../../assets/manage-stock.webp"
import servicesCap from "../../assets/services-cap.webp"
import recruitingCapSmall from "../../assets/recruiting-640.webp"
import recruitingCapMid from "../../assets/recruiting-800.webp"
import manageStockCapSmall from "../../assets/manage-stock-640.webp"
import servicesCapSmall from "../../assets/services-cap-640.webp"
import { LandingImg, screenshotSrcSet } from "./LandingImage"
import {
  LandingBlockTitle,
  LandingBodyText,
  LandingSectionTitle,
} from "./LandingTypography"

/** A square-cropped screenshot; width/height are the full file's pixel size. */
function LandingSmallImage(props: {
  src: string
  smallSrc: string
  /** Optional 800px variant (see screenshotSrcSet). */
  midSrc?: string
  width: number
  height: number
  title: string
}) {
  const { src, smallSrc, midSrc, width, height, title } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"column"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <LandingImg
        src={src}
        srcSet={screenshotSrcSet(smallSrc, src, width, midSrc)}
        sizes="(min-width: 900px) 400px, 100vw"
        width={width}
        height={height}
        sx={{
          width: "100%",
          height: "auto",
          aspectRatio: "1/1",
          border: `1px solid ${theme.palette.outline.main}`,
          marginBottom: theme.spacing(2),
          objectFit: "cover",
          borderRadius: theme.spacing(theme.borderRadius.button),
        }}
        alt={title}
        loading="lazy"
        decoding="async"
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
            smallSrc={recruitingCapSmall}
            midSrc={recruitingCapMid}
            width={1909}
            height={1699}
            title={t("landing.orgRecruitment")}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <LandingSmallImage
            src={servicesCap}
            smallSrc={servicesCapSmall}
            width={899}
            height={847}
            title={t("landing.serviceListings")}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <LandingSmallImage
            src={manageStockCap}
            smallSrc={manageStockCapSmall}
            width={857}
            height={839}
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
          {/* Give the link a descriptive name (a bare "Learn More" fails the
              link-text audit); the visible label stays the same. */}
          <span className="sr-only">: {t("landing.forOrgs")}</span>
        </Button>
      </Stack>
    </Stack>
  )
}
