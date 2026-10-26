import React, { ReactNode } from "react"
import { Box, Button, Grid2, Stack } from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { useTheme, type SxProps } from "@mui/material/styles"
import { Link } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { Discord } from "../icon/DiscordIcon"
import { DISCORD_BOT_INVITE } from "../../util/constants"
import {
  GAME_DATA_PATHS,
  MARKET_PATHS,
  PATHS,
  WIKI_PATHS,
} from "../../routes/paths"
import buyOrdersCap from "../../assets/buy-orders.webp"
import miningDbCap from "../../assets/mining-db.webp"
import openContractsCap from "../../assets/open-contracts-2026.webp"
import {
  LandingBlockTitle,
  LandingBodyText,
  LandingSectionTitle,
} from "./LandingTypography"

/** A feature screenshot. width/height are the file's pixel size (no layout shift). */
interface FeatureImage {
  src: string
  width: number
  height: number
  alt: string
}

/** A hub link: internal routes use the router, external ones open a new tab. */
type FeatureLink = { label: string } & ({ to: string } | { href: string })

/**
 * The 16:9 tile every feature shows above its text: full block width,
 * outlined, button radius, like the "For Orgs" images. The screenshots are cut
 * to exactly 16:9, so the image fills the frame and the outline sits on its
 * edge. The fill matches the screenshots' dark page background, so the icon
 * tile reads as one of the set.
 */
function FeatureMedia(props: { image?: FeatureImage; icon?: ReactNode }) {
  const { image, icon } = props
  const theme = useTheme<ExtendedTheme>()

  const frame = {
    display: "block",
    width: "100%",
    aspectRatio: "16/9",
    border: `1px solid ${theme.palette.outline.main}`,
    borderRadius: theme.spacing(theme.borderRadius.button),
    backgroundColor: theme.palette.background.default,
    boxSizing: "border-box",
    overflow: "hidden",
  } as const

  if (image) {
    return (
      <Box
        component="img"
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        sx={{ ...frame, height: "auto", objectFit: "cover" }}
      />
    )
  }

  return (
    <Box
      aria-hidden
      sx={{
        ...frame,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
      }}
    >
      {icon}
    </Box>
  )
}

/** Narrowest a 16:9 feature tile may get before the blocks go one per row. */
export const MIN_FEATURE_TILE_WIDTH = 360

/**
 * The feature blocks sit two per row only when the section itself is wide
 * enough for two tiles of at least MIN_FEATURE_TILE_WIDTH plus the gap. This
 * is a container query, not a viewport breakpoint: with the sidebar open at a
 * ~900px window the section is only ~530px wide, and the old md breakpoint put
 * two ~250px tiles side by side.
 */
export function featureTileGrid(theme: ExtendedTheme): {
  container: SxProps
  grid: SxProps
} {
  const gap = parseFloat(theme.spacing(theme.layoutSpacing.layout * 4))
  return {
    container: { containerType: "inline-size" },
    grid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: `${gap}px`,
      [`@container (min-width: ${MIN_FEATURE_TILE_WIDTH * 2 + gap}px)`]: {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      },
    },
  }
}

function LandingFeatureBlock(props: {
  title: string
  text: string
  image?: FeatureImage
  icon?: ReactNode
  links: FeatureLink[]
}) {
  const { title, text, image, icon, links } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack direction={"column"} spacing={theme.layoutSpacing.component}>
      <FeatureMedia image={image} icon={icon} />
      <LandingBlockTitle>{title}</LandingBlockTitle>
      <LandingBodyText>{text}</LandingBodyText>
      <Stack
        direction={"row"}
        sx={{ flexWrap: "wrap", gap: 1 }}
        justifyContent={"center"}
      >
        {links.map((link) =>
          "to" in link ? (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              variant={"outlined"}
              color={"secondary"}
            >
              {link.label}
            </Button>
          ) : (
            <Button
              key={link.href}
              href={link.href}
              target={"_blank"}
              rel={"noopener noreferrer"}
              variant={"outlined"}
              color={"secondary"}
            >
              {link.label}
            </Button>
          ),
        )}
      </Stack>
    </Stack>
  )
}

export function LandingFeatures() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const tiles = featureTileGrid(theme)

  return (
    <Box component={"section"}>
      {/* The blocks below are <h3>s; this keeps them under a section <h2>
          without adding a visible title to the page. */}
      <LandingSectionTitle sx={visuallyHidden}>
        {t("landing.featuresTitle")}
      </LandingSectionTitle>
      <Stack direction={"column"} spacing={theme.layoutSpacing.layout * 8}>
        <Grid2
          container
          justifyContent={"center"}
          spacing={theme.layoutSpacing.layout * 4}
        >
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Stack direction={"column"} spacing={theme.layoutSpacing.component}>
              <LandingBlockTitle>
                {t("landing.buySellItemsTitle")}
              </LandingBlockTitle>
              <LandingBodyText>{t("landing.buySellItemsText")}</LandingBodyText>
            </Stack>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <Stack direction={"column"} spacing={theme.layoutSpacing.component}>
              <LandingBlockTitle>
                {t("landing.tradeInBulkTitle")}
              </LandingBlockTitle>
              <LandingBodyText>{t("landing.tradeInBulkText")}</LandingBodyText>
            </Stack>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <Stack direction={"column"} spacing={theme.layoutSpacing.component}>
              <LandingBlockTitle>
                {t("landing.orderServicesTitle")}
              </LandingBlockTitle>
              <LandingBodyText>
                {t("landing.orderServicesText")}
              </LandingBodyText>
            </Stack>
          </Grid2>
        </Grid2>

        <Box sx={tiles.container}>
          <Box sx={tiles.grid} data-testid={"landing-feature-tiles"}>
            <Box>
              <LandingFeatureBlock
                title={t("landing.buyOrdersTitle")}
                text={t("landing.buyOrdersText")}
                image={{
                  src: buyOrdersCap,
                  width: 1280,
                  height: 720,
                  alt: t("landing.buyOrdersImageAlt"),
                }}
                links={[
                  {
                    label: t("landing.buyOrdersLink"),
                    to: MARKET_PATHS.buyOrders,
                  },
                ]}
              />
            </Box>

            <Box>
              <LandingFeatureBlock
                title={t("landing.gameDataTitle")}
                text={t("landing.gameDataText")}
                image={{
                  src: miningDbCap,
                  width: 1280,
                  height: 720,
                  alt: t("landing.gameDataImageAlt"),
                }}
                links={[
                  {
                    label: t("landing.gameDataMining"),
                    to: GAME_DATA_PATHS.mining,
                  },
                  {
                    label: t("landing.gameDataMissions"),
                    to: GAME_DATA_PATHS.missions,
                  },
                  {
                    label: t("landing.gameDataBlueprints"),
                    to: GAME_DATA_PATHS.blueprints,
                  },
                  { label: t("landing.gameDataWiki"), to: WIKI_PATHS.hub },
                ]}
              />
            </Box>

            <Box>
              <LandingFeatureBlock
                title={t("landing.discordBotTitle")}
                text={t("landing.discordBotText")}
                icon={<Discord sx={{ fontSize: theme.spacing(12) }} />}
                links={[
                  {
                    label: t("landing.discordBotLink"),
                    href: DISCORD_BOT_INVITE,
                  },
                ]}
              />
            </Box>

            <Box>
              <LandingFeatureBlock
                title={t("landing.contractsTitle")}
                text={t("landing.contractsText")}
                image={{
                  src: openContractsCap,
                  width: 1280,
                  height: 720,
                  alt: t("landing.contractsImageAlt"),
                }}
                links={[
                  { label: t("landing.contractsLink"), to: PATHS.contracts },
                  { label: t("landing.recruitingLink"), to: PATHS.recruiting },
                ]}
              />
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}
