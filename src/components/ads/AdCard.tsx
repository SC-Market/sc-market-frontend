import { Paper, Fade, Box, Typography } from "@mui/material"
import React from "react"
import { useTranslation } from "react-i18next"
import { AdConfig, ImageAdConfig, PosterAdConfig } from "./types"
import { ListingWrapper } from "../../features/market/components/listings/ListingWrapper"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  AD_CARD_HEIGHT,
  POSTER_GAP,
  POSTER_MIN_SPACER,
  POSTER_PADDING,
  POSTER_RULE,
  POSTER_SPINE_WIDTH,
  POSTER_TYPE,
  fluidCss,
} from "./posterLayout"

interface AdCardProps {
  /** The ad configuration to display */
  ad: AdConfig
  /** Index for animation delay */
  index: number
  /** If true, renders without wrapper (for use in VirtualizedGrid) */
  noGridWrapper?: boolean
}

/**
 * A ship poster image. Its copy is baked in and runs close to the image's
 * edges (Ares: a line at the very top and bottom; Perseus: a tagline nearly
 * as wide as the image), while the card's shape changes with the grid: from
 * about 0.45 (a 130px card on a crowded desktop row) to 1.25 (380px) wide per
 * unit of height, against the images' 0.64 (Ares) and 0.82 (Perseus).
 * Cropping to fill the card (object-fit: cover) cut that copy off on every
 * card not of the image's own shape, so the whole image is shown (contain),
 * over a blurred, darkened copy of itself filling the bands either side.
 */
function ImageCreative(props: { ad: ImageAdConfig }) {
  const { ad } = props
  const { t } = useTranslation()
  return (
    <Box sx={{ position: "relative", height: "100%", bgcolor: "common.black" }}>
      <Box
        component="img"
        src={ad.imageUrl}
        alt=""
        aria-hidden
        loading="lazy"
        data-testid="ad-image-backdrop"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(14px) brightness(0.55)",
          transform: "scale(1.15)",
        }}
      />
      <Box
        component="img"
        src={ad.imageUrl}
        alt={t("appUi.ads.imageAlt", { title: ad.title })}
        loading="lazy"
        sx={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    </Box>
  )
}

/**
 * A CSS-drawn in-universe poster: a hazard-striped spine, HUD corner
 * brackets, a big condensed title and a call to action, in the ad's accent
 * colour. The copy is translated; the brand line and the fan-made
 * disclaimer sit at the foot so it never reads as an official RSI notice.
 *
 * Nothing is clamped or ellipsised: the box model and type scale come from
 * posterLayout.ts, and __tests__/posterFit.test.ts checks that every
 * locale's copy fits a card of every width the market grids use.
 */
function PosterCreative(props: { ad: PosterAdConfig }) {
  const { ad } = props
  const { t } = useTranslation()
  const type = POSTER_TYPE
  const bracket = {
    position: "absolute",
    width: 18,
    height: 18,
    borderColor: ad.accent,
    borderStyle: "solid",
    opacity: 0.8,
  } as const
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        containerType: "inline-size",
        overflow: "hidden",
        color: "#e8eef7",
        background: `radial-gradient(120% 70% at 85% 10%, ${ad.accent}33 0%, transparent 60%), linear-gradient(165deg, #0d1626 0%, #0a101c 55%, #06090f 100%)`,
        // Faint scan lines, like a holo-billboard.
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)",
          pointerEvents: "none",
        },
      }}
    >
      {/* Hazard-striped spine */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: POSTER_SPINE_WIDTH,
          background: `repeating-linear-gradient(135deg, ${ad.accent} 0 6px, transparent 6px 12px)`,
          opacity: 0.55,
        }}
      />
      <Box
        aria-hidden
        sx={{ ...bracket, top: 6, right: 6, borderWidth: "2px 2px 0 0" }}
      />
      <Box
        aria-hidden
        sx={{ ...bracket, bottom: 6, right: 6, borderWidth: "0 2px 2px 0" }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          pl: `${POSTER_PADDING.left}px`,
          pr: `${POSTER_PADDING.right}px`,
          pt: `${POSTER_PADDING.top}px`,
          pb: `${POSTER_PADDING.bottom}px`,
          "& > p": { m: 0, flexShrink: 0 },
        }}
      >
        <Typography
          component="p"
          sx={{
            fontSize: type.kicker.size,
            lineHeight: type.kicker.lineHeight,
            letterSpacing: `${type.kicker.letterSpacing}em`,
            textTransform: "uppercase",
            color: ad.accent,
            fontWeight: 700,
          }}
        >
          {t(`${ad.copyKey}.kicker`)}
        </Typography>
        <Typography
          component="p"
          sx={{
            mt: `${POSTER_GAP}px`,
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: type.title.lineHeight,
            letterSpacing: `${type.title.letterSpacing}em`,
            fontSize: fluidCss(type.title.size),
            overflowWrap: "break-word",
            textShadow: `0 0 18px ${ad.accent}55`,
          }}
        >
          {t(`${ad.copyKey}.title`)}
        </Typography>
        <Box
          aria-hidden
          sx={{
            mt: `${POSTER_GAP}px`,
            flexShrink: 0,
            width: POSTER_RULE.width,
            height: POSTER_RULE.height,
            bgcolor: ad.accent,
          }}
        />
        <Typography
          component="p"
          sx={{
            mt: `${POSTER_GAP}px`,
            fontSize: fluidCss(type.tagline.size),
            lineHeight: type.tagline.lineHeight,
            opacity: 0.85,
          }}
        >
          {t(`${ad.copyKey}.tagline`)}
        </Typography>
        <Box sx={{ flex: 1, minHeight: POSTER_MIN_SPACER }} />
        <Typography
          component="p"
          sx={{
            alignSelf: "flex-start",
            px: `${type.cta.padX}px`,
            py: `${type.cta.padY}px`,
            border: `${type.cta.border}px solid ${ad.accent}`,
            color: ad.accent,
            fontSize: type.cta.size,
            lineHeight: type.cta.lineHeight,
            fontWeight: 700,
            letterSpacing: `${type.cta.letterSpacing}em`,
            textTransform: "uppercase",
          }}
        >
          {t(`${ad.copyKey}.cta`)}
        </Typography>
        <Typography
          component="p"
          sx={{
            mt: `${POSTER_GAP}px`,
            fontSize: type.brand.size,
            lineHeight: type.brand.lineHeight,
            fontWeight: 800,
            letterSpacing: `${type.brand.letterSpacing}em`,
            textTransform: "uppercase",
          }}
        >
          SC Orgs
        </Typography>
        <Typography
          component="p"
          sx={{
            fontSize: type.disclaimer.size,
            lineHeight: type.disclaimer.lineHeight,
            opacity: 0.55,
          }}
        >
          {t("ads.scOrgs.disclaimer")}
        </Typography>
      </Box>
    </Box>
  )
}

/**
 * AdCard component that displays an ad in a Paper component the size of a listing.
 * Opens the ad link in a new tab when clicked.
 */
export function AdCard(props: AdCardProps) {
  const { ad, index, noGridWrapper = false } = props
  const theme = useTheme<ExtendedTheme>()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.open(ad.linkUrl, "_blank", "noopener,noreferrer")
  }

  const content = (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <a
        href={ad.linkUrl}
        onClick={handleClick}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
          width: "100%",
          height: "100%",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            height: AD_CARD_HEIGHT,
            position: "relative",
            overflow: "hidden",
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            cursor: "pointer",
            width: "100%",
            "&:hover": {
              elevation: 6,
            },
          }}
        >
          {ad.kind === "image" ? (
            <ImageCreative ad={ad} />
          ) : (
            <PosterCreative ad={ad} />
          )}
        </Paper>
      </a>
    </Fade>
  )

  if (noGridWrapper) {
    return <Box sx={{ width: "100%", height: "100%" }}>{content}</Box>
  }

  return <ListingWrapper>{content}</ListingWrapper>
}
