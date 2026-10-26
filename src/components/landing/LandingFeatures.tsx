import React, { ReactNode } from "react"
import { Box, Button, Grid2, Stack } from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { useTheme } from "@mui/material/styles"
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
import buyOrdersCapSmall from "../../assets/buy-orders-640.webp"
import miningDbCapSmall from "../../assets/mining-db-640.webp"
import openContractsCapSmall from "../../assets/open-contracts-2026-640.webp"
import buyOrdersCapMid from "../../assets/buy-orders-800.webp"
import miningDbCapMid from "../../assets/mining-db-800.webp"
import openContractsCapMid from "../../assets/open-contracts-2026-800.webp"
import { LandingImg, screenshotSrcSet } from "./LandingImage"
import { featureTileGrid } from "./featureTileGrid"
import {
  LandingBlockTitle,
  LandingBodyText,
  LandingSectionTitle,
} from "./LandingTypography"

/** A feature screenshot. width/height are the file's pixel size (no layout shift). */
interface FeatureImage {
  src: string
  /** The 640px variant, offered next to `src` in a srcset. */
  smallSrc: string
  /** The 800px variant (see screenshotSrcSet). */
  midSrc?: string
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
      <LandingImg
        src={image.src}
        srcSet={screenshotSrcSet(
          image.smallSrc,
          image.src,
          image.width,
          image.midSrc,
        )}
        sizes="(min-width: 900px) 560px, 100vw"
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
                  smallSrc: buyOrdersCapSmall,
                  midSrc: buyOrdersCapMid,
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
                  smallSrc: miningDbCapSmall,
                  midSrc: miningDbCapMid,
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
                  smallSrc: openContractsCapSmall,
                  midSrc: openContractsCapMid,
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
