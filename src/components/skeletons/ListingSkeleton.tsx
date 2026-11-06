import { Box, Card, CardContent, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme, cardFadeGradient } from "../../hooks/styles/Theme"
import { NUMERIC_SX } from "../../hooks/styles/theme/fonts"
import { ListingWrapper } from "../../features/market/components/listings/ListingWrapper"
import { listingCardActionAreaSx } from "../../features/market/components/listings/ListingCardActionArea"
import { LISTING_CARD_HEIGHT } from "../../features/market/v2/marketSearchLayout"

/** Light mode: the photo's height above the card's text (ListingCardV2). */
export const LISTING_CARD_MEDIA_HEIGHT = 180

/**
 * A market listing card (ListingCardV2) as a placeholder. Built from the
 * card's own pieces: ListingWrapper, the action area's box
 * (listingCardActionAreaSx), a Card of LISTING_CARD_HEIGHT, the photo at the
 * card's size (the whole card in dark mode, 180px in light mode) under the
 * same fade, and the text lines in the card's Typography (price h6, title
 * body2 two lines, shop and rating captions), so each line has the card's
 * line height. Returns the wrapper (use it in a grid item or a row).
 *
 * No fade-in: the market passes through several loading boundaries (route
 * skeleton, chunk fallbacks, the grid loading its data), and each one mounts
 * its own copy of these cards. With a fade, every swap blanked the cards and
 * faded them back in, so one load looked like several skeletons in a row.
 */
export function ListingSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const dark = theme.palette.mode === "dark"

  return (
    <ListingWrapper data-testid="listing-card-skeleton">
      <Box
        sx={listingCardActionAreaSx}
        aria-hidden
        data-skeleton="listing-card"
      >
        <Card sx={{ height: LISTING_CARD_HEIGHT, position: "relative" }}>
          <BaseSkeleton
            variant="rectangular"
            animation="wave"
            width="100%"
            height={dark ? "100%" : LISTING_CARD_MEDIA_HEIGHT}
          />
          {dark && (
            <Box
              sx={{
                position: "absolute",
                zIndex: 3,
                inset: 0,
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
                background: cardFadeGradient(theme, 50, 60),
              }}
            />
          )}
          <CardContent
            sx={{
              ...(dark ? { position: "absolute", bottom: 0, zIndex: 4 } : {}),
              width: "100%",
              boxSizing: "border-box",
              maxWidth: "100%",
              padding: "8px 12px !important",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ ...NUMERIC_SX, fontSize: "0.95rem", mb: 0.5 }}
            >
              <BaseSkeleton variant="text" width={100} />
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{ fontSize: "0.75rem", lineHeight: 1.3, mb: 0.5 }}
            >
              <BaseSkeleton variant="text" width="95%" />
              <BaseSkeleton variant="text" width="70%" />
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{ fontSize: "0.7rem", lineHeight: 1.2, mb: 0.25 }}
            >
              <BaseSkeleton variant="text" width={70} />
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <BaseSkeleton variant="text" width={64} height={16} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ListingWrapper>
  )
}
