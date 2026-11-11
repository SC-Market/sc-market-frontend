import { SellerStatusBadge } from "../../../components/presence/SellerStatusBadge"
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Chip,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { isListingNew } from "../domain/listingBadges"
import { useNavigate } from "react-router-dom"
import {
  ExtendedTheme,
  cardFadeGradient,
  primaryFill,
} from "../../../hooks/styles/Theme"
import { MISSING_IMAGE_URL } from "../../../util/constants"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { MarketListingRating } from "../../../components/rating/ListingRating"
import type { ListingSearchResult } from "../../../store/api/v2/market"
import { useFormatters, useNow } from "../../../util/format"
import { ListingWrapper } from "../components/listings/ListingWrapper"
import { ListingCardActionArea } from "../components/listings/ListingCardActionArea"
import { AddShoppingCartRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useCartDrawer } from "../hooks/AddToCartContext"
import { formatMarketUrl } from "../domain/urls"
import { SHOP_PATHS } from "../../../routes/paths"
import { LISTING_CARD_HEIGHT } from "./marketSearchLayout"
import {
  CARD_CHIP_SX,
  NEUTRAL_CARD_CHIP_SX,
  cardChipStackSx,
} from "./cardChips"
import { qualityChipSx, qualityRangeChip } from "../../../util/qualityColor"
import { TagChip } from "../../../components/tags/TagChip"
import { NUMERIC_SX } from "../../../hooks/styles/theme/fonts"

/**
 * ListingCardV2 - V2 listing card using native V2 ListingSearchResult fields.
 *
 * Does NOT transform to V1 types. Uses CardContent with V1-matching typography
 * (h6 for price, body2 for title, caption for seller) and quality tier badges.
 */
export interface ListingCardV2Props {
  listing: ListingSearchResult
  index: number
  /** In the grid's first rows: fetch the image at high priority. */
  priority?: boolean
}

export function ListingCardV2({
  listing,
  priority = false,
}: ListingCardV2Props) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { openAddToCart } = useCartDrawer()
  const fmt = useFormatters()
  const now = useNow()

  const priceDisplay = fmt.priceRange(listing.price_min, listing.price_max)

  const isNew = isListingNew(listing.created_at, new Date(now))

  // No fade-in: the cards replace their skeletons in place; a fade from
  // opacity 0 blanked the grid between skeleton and content.
  return (
    <>
      <ListingWrapper
        useFixedWidth={false}
        data-testid="listing-card"
        data-id={listing.listing_id}
      >
        <ListingCardActionArea to={formatMarketUrl(listing)}>
          <Card sx={{ height: LISTING_CARD_HEIGHT, position: "relative" }}>
            {/* Corner chip stacks. Each corner is a flex column so chips can
                never overlap regardless of which combination is present —
                previously quality and NEW were both pinned to top-left for
                out-of-stock listings, and internal/bulk shared bottom-right
                via hand-computed offsets. */}
            <Box sx={cardChipStackSx("top-left")}>
              {isNew && (
                <Chip
                  label={t("market.new", "NEW")}
                  variant="outlined"
                  size="small"
                  sx={{ ...CARD_CHIP_SX, ...NEUTRAL_CARD_CHIP_SX }}
                />
              )}
              {listing.has_bulk_discount && (
                <TagChip
                  tag="discount"
                  label={t("market.bulkDiscount", "BULK DISCOUNT")}
                  sx={CARD_CHIP_SX}
                />
              )}
            </Box>
            <Box sx={cardChipStackSx("top-right")}>
              {(() => {
                const qc = qualityRangeChip(listing)
                return (
                  qc && (
                    <Chip
                      label={qc.label}
                      size="small"
                      sx={{
                        ...CARD_CHIP_SX,
                        textTransform: "none",
                        ...qualityChipSx(qc.color),
                      }}
                    />
                  )
                )
              })()}
              {listing.quantity_available === 0 && (
                <Chip
                  label={t("market.outOfStock", "OUT OF STOCK")}
                  color="error"
                  size="small"
                  sx={CARD_CHIP_SX}
                />
              )}
              {listing.visibility === "private" && (
                <Chip
                  label={t("market.internalListing")}
                  color="warning"
                  size="small"
                  sx={CARD_CHIP_SX}
                />
              )}
              {/* Only a site admin's search with includeUnlisted ever returns these. */}
              {listing.visibility === "unlisted" && (
                <Chip
                  label={t("market.unlistedListing", "Unlisted")}
                  color="default"
                  size="small"
                  sx={CARD_CHIP_SX}
                />
              )}
            </Box>
            <CardMedia
              component="img"
              loading="lazy"
              // Intrinsic 16:9 size (CSS sets the displayed size).
              width={320}
              height={180}
              fetchPriority={priority ? "high" : undefined}
              image={listing.photo || MISSING_IMAGE_URL}
              sx={{
                width: "100%",
                objectFit: "cover",
                ...(theme.palette.mode === "dark"
                  ? { height: "100%", aspectRatio: "16/9" }
                  : { height: 180, aspectRatio: "16/9" }),
                overflow: "hidden",
              }}
              alt={t("marketV2.imageOf", { name: listing.title })}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light" ? { display: "none" } : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
                background: cardFadeGradient(theme, 50, 60),
              }}
            />
            <CardContent
              sx={{
                ...(theme.palette.mode === "dark"
                  ? { position: "absolute", bottom: 0, zIndex: 4 }
                  : {}),
                maxWidth: "100%",
                padding: "8px 12px !important",
              }}
            >
              <Typography
                variant="h6"
                component="p"
                color="primary"
                fontWeight={600}
                noWrap
                sx={{ ...NUMERIC_SX, fontSize: "0.95rem", mb: 0.5 }}
              >
                {priceDisplay}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.3,
                  maxHeight: 36,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  mb: 0.5,
                }}
              >
                {listing.title}
              </Typography>
              <Box sx={{ mb: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.25,
                    flexWrap: "wrap",
                  }}
                >
                  <UnderlineLink
                    component="span"
                    display="inline"
                    noWrap
                    variant="caption"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      navigate(SHOP_PATHS.profile(listing.shop_slug))
                    }}
                    sx={{
                      overflowX: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {listing.shop_name}
                  </UnderlineLink>
                </Box>
                <Box
                  sx={{
                    fontSize: "0.7rem",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    mt: 0,
                    mb: 0,
                  }}
                >
                  <MarketListingRating
                    avg_rating={listing.shop_rating}
                    rating_count={listing.shop_rating_count ?? null}
                    total_rating={0}
                    rating_streak={null}
                    total_orders={null}
                    total_assignments={null}
                    response_rate={null}
                    badge_ids={listing.shop_badge_ids}
                    display_limit={3}
                    showBadges={true}
                  />
                </Box>
                <SellerStatusBadge activity={listing.shop_activity} compact />
              </Box>
            </CardContent>
          </Card>
        </ListingCardActionArea>
        {listing.quantity_available > 0 && (
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation()
              openAddToCart(listing.listing_id)
            }}
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              zIndex: 5,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": {
                bgcolor: primaryFill,
                color: "primary.contrastText",
              },
            }}
            aria-label={t("cart.addItemToCart", "Add {{title}} to cart", {
              title: listing.title,
            })}
          >
            <AddShoppingCartRounded fontSize="small" />
          </IconButton>
        )}
      </ListingWrapper>
    </>
  )
}
