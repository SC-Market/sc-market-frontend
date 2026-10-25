import React, { ReactNode } from "react"
import { Box, Button, Grid2, Stack, Typography } from "@mui/material"
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
 * The square tile every feature shows above its text. Same frame as the
 * "For Orgs" images (LandingSmallImage): 1:1, outlined, button radius, with
 * the screenshot covering the frame. From md up the blocks sit two per row, so
 * the tile takes two thirds of the block to come out the size of those
 * three-per-row images. The fill matches the screenshots' dark page background,
 * so the icon tile reads as one of the set.
 */
function FeatureMedia(props: { image?: FeatureImage; icon?: ReactNode }) {
  const { image, icon } = props
  const theme = useTheme<ExtendedTheme>()

  const frame = {
    display: "block",
    width: { xs: "100%", md: "66.667%" },
    alignSelf: "center",
    aspectRatio: "1/1",
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
      <Typography
        variant={"h4"}
        sx={{ fontWeight: "bold", textAlign: "center" }}
        color={"text.secondary"}
      >
        {title}
      </Typography>
      <Typography
        variant={"body1"}
        sx={{ textAlign: "left" }}
        color={"text.secondary"}
      >
        {text}
      </Typography>
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

  return (
    <Stack direction={"column"} spacing={theme.layoutSpacing.layout * 8}>
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

      <Grid2
        container
        justifyContent={"center"}
        spacing={theme.layoutSpacing.layout * 4}
      >
        <Grid2 size={{ xs: 12, md: 6 }}>
          <LandingFeatureBlock
            title={t("landing.buyOrdersTitle")}
            text={t("landing.buyOrdersText")}
            image={{
              src: buyOrdersCap,
              width: 1000,
              height: 1000,
              alt: t("landing.buyOrdersImageAlt"),
            }}
            links={[
              { label: t("landing.buyOrdersLink"), to: MARKET_PATHS.buyOrders },
            ]}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <LandingFeatureBlock
            title={t("landing.gameDataTitle")}
            text={t("landing.gameDataText")}
            image={{
              src: miningDbCap,
              width: 1000,
              height: 1000,
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
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <LandingFeatureBlock
            title={t("landing.discordBotTitle")}
            text={t("landing.discordBotText")}
            icon={<Discord sx={{ fontSize: theme.spacing(12) }} />}
            links={[
              { label: t("landing.discordBotLink"), href: DISCORD_BOT_INVITE },
            ]}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <LandingFeatureBlock
            title={t("landing.contractsTitle")}
            text={t("landing.contractsText")}
            image={{
              src: openContractsCap,
              width: 1000,
              height: 1000,
              alt: t("landing.contractsImageAlt"),
            }}
            links={[
              { label: t("landing.contractsLink"), to: PATHS.contracts },
              { label: t("landing.recruitingLink"), to: PATHS.recruiting },
            ]}
          />
        </Grid2>
      </Grid2>
    </Stack>
  )
}
