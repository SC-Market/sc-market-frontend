import React from "react"
import { Box, Link as MaterialLink, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import bird32 from "../../assets/supporters/birdinc-32.webp"
import bird64 from "../../assets/supporters/birdinc-64.webp"
import unn32 from "../../assets/supporters/unn-32.webp"
import unn64 from "../../assets/supporters/unn-64.webp"
import char32 from "../../assets/supporters/char-32.webp"
import char64 from "../../assets/supporters/char-64.webp"
import { LandingImg } from "./LandingImage"

/** Supporter logos are shown this tall (px); the files are 1x and 2x of it. */
const SUPPORTER_LOGO_HEIGHT = 32

const SUPPORTERS = [
  {
    src: bird32,
    src2x: bird64,
    width: 89,
    url: "https://robertsspaceindustries.com/en/orgs/BIRDINC",
    name: "BIRD Inc",
  },
  {
    src: unn32,
    src2x: unn64,
    width: 128,
    url: "https://joinunn.com/",
    name: "The Unnamed",
  },
  {
    src: char32,
    src2x: char64,
    width: 112,
    url: "https://robertsspaceindustries.com/orgs/CHAR",
    name: "Char Holdings",
  },
]

/** "Our Supporters": the supporting orgs' logos and the Patreon thanks. Static. */
export function SupportersSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Box data-testid="landing-supporters">
      <Typography
        variant="h6"
        component="h3"
        color="text.secondary"
        sx={{ fontSize: "1rem", fontWeight: "bold", mb: 0.5 }}
      >
        {t("landing.supportersTitle")}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ mb: 1.25 }}>
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
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}
      >
        {SUPPORTERS.map((supporter) => (
          <MaterialLink
            key={supporter.name}
            href={supporter.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(
              "accessibility.viewSupporterWebsite",
              "Visit {{name}} website",
              { name: supporter.name },
            )}
            sx={{ display: "block", lineHeight: 0 }}
          >
            <LandingImg
              src={supporter.src}
              srcSet={`${supporter.src} 1x, ${supporter.src2x} 2x`}
              width={supporter.width}
              height={SUPPORTER_LOGO_HEIGHT}
              loading="lazy"
              decoding="async"
              sx={{
                height: SUPPORTER_LOGO_HEIGHT,
                width: "auto",
                borderRadius: theme.spacing(theme.borderRadius.image),
              }}
              alt={t("accessibility.supporterLogo", "{{name}} logo", {
                name: supporter.name,
              })}
            />
          </MaterialLink>
        ))}
      </Box>
    </Box>
  )
}
