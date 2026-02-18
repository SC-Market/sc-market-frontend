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

export function SupportersSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const supporters = [
    {
      avatar: BirdIncLogo,
      url: "https://robertsspaceindustries.com/en/orgs/BIRDINC",
      name: "BIRD Inc",
    },
    {
      avatar: UNNLogo,
      url: "https://joinunn.com/",
      name: "The Unnamed",
    },
    {
      avatar: CharLogo,
      url: "https://robertsspaceindustries.com/orgs/CHAR",
      name: "Char Holdings",
    },
  ]

  return (
    <Stack spacing={theme.layoutSpacing.layout} sx={{ maxWidth: "100%" }}>
      <Typography
        variant={"h3"}
        sx={{ fontWeight: "bold", textAlign: "center" }}
        color={"text.secondary"}
      >
        {t("landing.supportersTitle")}
      </Typography>
      <Typography
        variant={"h5"}
        sx={{ textAlign: "center" }}
        color={"text.primary"}
      >
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
      </Typography>
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
                <img
                  src={supporter.avatar}
                  style={{
                    maxHeight: 128,
                    maxWidth: "100%",
                    borderRadius: `${theme.spacing(theme.borderRadius.button)}px`,
                  }}
                  alt={t("accessibility.supporterLogo", "{{name}} logo", {
                    name: supporter.name,
                  })}
                />
              </ButtonBase>

              <Typography
                variant={"body2"}
                align={"center"}
                color={"text.secondary"}
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
