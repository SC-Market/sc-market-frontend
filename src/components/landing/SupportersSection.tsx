import React from "react"
import {
  ButtonBase,
  Link as MaterialLink,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import CharLogo from "../../assets/CharHoldings_Logo.png"
import UNNLogo from "../../assets/UNN_Traders_Logo.webp"
import BirdIncLogo from "../../assets/birdinc.jpg"
import { LandingBodyText, LandingSectionTitle } from "./LandingTypography"
import { LandingImg } from "./LandingImage"

/** Supporter logos are shown 128px tall; width/height are the files' pixel sizes. */
const SUPPORTER_LOGO_HEIGHT = 128

export function SupportersSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const supporters = [
    {
      avatar: BirdIncLogo,
      width: 691,
      height: 248,
      url: "https://robertsspaceindustries.com/en/orgs/BIRDINC",
      name: "BIRD Inc",
    },
    {
      avatar: UNNLogo,
      width: 1024,
      height: 256,
      url: "https://joinunn.com/",
      name: "The Unnamed",
    },
    {
      avatar: CharLogo,
      width: 895,
      height: 256,
      url: "https://robertsspaceindustries.com/orgs/CHAR",
      name: "Char Holdings",
    },
  ]

  return (
    <Stack spacing={theme.layoutSpacing.layout} sx={{ maxWidth: "100%" }}>
      <LandingSectionTitle>{t("landing.supportersTitle")}</LandingSectionTitle>
      <LandingBodyText sx={{ textAlign: "center" }}>
        {t("landing.supportersThanks")}
        <MaterialLink
          color={"secondary"}
          target={"_blank"}
          rel="noopener noreferrer"
          underline={"hover"}
          href={"https://www.patreon.com/henry232323"}
        >
          Patreon
        </MaterialLink>{" "}
        {t("landing.supporters")}
      </LandingBodyText>
      <Stack
        sx={{ maxWidth: "100%", overflow: "scroll", flexWrap: "wrap" }}
        useFlexGap
        spacing={theme.layoutSpacing.layout}
        direction={"row"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        {supporters.map((supporter) => (
          <MaterialLink
            href={supporter.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
            key={supporter.name}
          >
            <Stack
              spacing={theme.layoutSpacing.text}
              direction={"column"}
              key={supporter.name}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <ButtonBase
                sx={{
                  borderRadius: theme.spacing(theme.borderRadius.topLevel),
                }}
                aria-label={t(
                  "accessibility.viewSupporterWebsite",
                  "Visit {{name}} website",
                  { name: supporter.name },
                )}
              >
                <LandingImg
                  src={supporter.avatar}
                  width={supporter.width}
                  height={supporter.height}
                  loading="lazy"
                  decoding="async"
                  sx={{
                    height: SUPPORTER_LOGO_HEIGHT,
                    width: "auto",
                    maxWidth: "100%",
                    objectFit: "contain",
                    borderRadius: theme.spacing(theme.borderRadius.button),
                  }}
                  alt={t("accessibility.supporterLogo", "{{name}} logo", {
                    name: supporter.name,
                  })}
                />
              </ButtonBase>

              <Typography
                variant={"body2"}
                align={"center"}
                color={"text.primary"}
              >
                {supporter.name}
              </Typography>
            </Stack>
          </MaterialLink>
        ))}
      </Stack>
    </Stack>
  )
}
