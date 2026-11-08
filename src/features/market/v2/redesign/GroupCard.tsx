import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Fade,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded"
import GroupsRounded from "@mui/icons-material/GroupsRounded"
import { useTranslation } from "react-i18next"
import { ExtendedTheme, cardFadeGradient } from "../../../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import type { ListingSearchResult } from "../../../../store/api/v2/market"
import {
  CARD_CHIP_SX,
  NEUTRAL_CARD_CHIP_SX,
  cardChipStackSx,
} from "../cardChips"
import {
  type QualityColor,
  qualityChipSx,
  qualityTierColor,
  qualityValueColor,
} from "../../../../util/qualityColor"
import { useFormatters } from "../../../../util/format"
import { TagChip } from "../../../../components/tags/TagChip"
import { NUMERIC_SX } from "../../../../hooks/styles/theme/fonts"
import { GroupSellers } from "./GroupSellers"
import { sellerCount as groupSellerCount } from "./groupSellerRule"
import { GroupBuyOrders } from "./GroupBuyOrders"
import { GroupSellersFallback } from "./GroupSellersFallback"

/**
 * GroupedListingGrid — market_v2_redesign variant of the search grid.
 *
 * Grafted into ListingSearchV2 in place of the internal `ListingGrid` when the
 * `market_v2_redesign` flag is on. Takes the SAME props as `ListingGrid` and
 * mirrors its loading-skeleton and empty-state behavior exactly.
 *
 * Grouping is CLIENT-SIDE over the currently-loaded page of results only (not
 * the whole catalog): fungible items (per ./fungibility.ts) that share the same
 * game_item_id collapse into ONE expandable group card when more than one seller
 * is present. Everything else (non-fungible, or fungible with a single seller)
 * renders as the REAL `ListingCardV2` at the normal grid size so it stays
 * pixel-identical to the flag-off view. Seller count = distinct shop_id.
 *
 * Only one group can be expanded at a time. Sellers within a group are sorted
 * cheapest-first; the page's own sort (via URL params) drives everything else.
 */

/**
 * Quality RANGE across every seller in a group — this is the aggregate signal a
 * buyer wants while scanning (not the cheapest listing's quality alone): "does
 * this item have the quality I need, roughly?". Colored by the best tier/value
 * available. Prefers value (0-1000) over tier (1-5), consistent with the chip.
 */
function groupQualityChipProps(
  listings: ListingSearchResult[],
): { label: string; color: QualityColor } | null {
  const values = listings.flatMap((l) =>
    [l.quality_value_min, l.quality_value_max].filter(
      (v): v is number => v != null,
    ),
  )
  if (values.length) {
    const min = Math.min(...values)
    const max = Math.max(...values)
    return {
      label: min === max ? `${min}` : `${min}–${max}`,
      color: qualityValueColor(max),
    }
  }
  const tiers = listings.flatMap((l) =>
    [l.quality_tier_min, l.quality_tier_max].filter(
      (v): v is number => v != null,
    ),
  )
  if (tiers.length) {
    const min = Math.min(...tiers)
    const max = Math.max(...tiers)
    return {
      label: min === max ? `Q${min}` : `Q${min}–${max}`,
      color: qualityTierColor(max),
    }
  }
  return null
}

/**
 * GroupCard — a fungible item sold by multiple sellers. Collapsed, it matches a
 * ListingCardV2 tile (same grid slot, height 300, CardMedia + dark-mode gradient
 * overlay + bottom CardContent). Expanded, the tile grows to a full row and
 * reveals per-seller options (rich sub-cards for ≤6 sellers, a compact
 * scrollable depth list beyond).
 */
export function GroupCard({
  listings,
  index,
  priority,
  open,
  onToggle,
}: {
  listings: ListingSearchResult[]
  index: number
  /** In the grid's first rows: fetch the image at high priority. */
  priority: boolean
  open: boolean
  onToggle: () => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const fmt = useFormatters()

  const cheapest = listings[0]
  // "N sellers" = distinct SHOPS, not listing rows (one shop can list the
  // item several times). Same rule as the expanded list (groupSellerRule.ts),
  // which shows one card per seller.
  const sellerCount = groupSellerCount(listings)
  const priceMin = Math.min(...listings.map((l) => l.price_min ?? 0))
  const priceMax = Math.max(
    ...listings.map((l) => l.price_max ?? l.price_min ?? 0),
  )
  const totalQuantity = listings.reduce(
    (sum, l) => sum + (l.quantity_available ?? 0),
    0,
  )
  // Aggregate quality RANGE across all sellers — the scan-level signal a buyer
  // wants, not just the cheapest listing's quality.
  const qc = groupQualityChipProps(listings)
  // Aggregate-level tags (parity with ListingCardV2, adapted to a group): show
  // BULK DISCOUNT if ANY seller offers one; the group is only fully out of stock
  // if EVERY seller is (a group is "available" as long as one seller has stock).
  const anyBulkDiscount = listings.some((l) => l.has_bulk_discount)
  const allOutOfStock = listings.every((l) => (l.quantity_available ?? 0) === 0)

  return (
    <Fade
      in={true}
      timeout={500}
      style={{ transitionDelay: `${50 + 50 * index}ms` }}
    >
      <Card
        sx={{
          position: "relative",
          height: open ? "auto" : 300,
          borderColor: open ? "outline.strong" : undefined,
          boxShadow: open ? 6 : 0,
          transition: theme.transitions.create(["box-shadow", "border-color"], {
            duration: theme.transitions.duration.shorter,
          }),
          // Read as interactive/expandable when collapsed, matching how the
          // normal listing tiles respond to hover.
          "&:hover": open ? undefined : { borderColor: "outline.strong" },
        }}
      >
        {/* Collapsed header region mirrors a ListingCardV2 tile */}
        <CardActionArea
          onClick={onToggle}
          sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
        >
          {/* Dark mode overlays text on a full-bleed image, so the container is
              a fixed height. Light mode stacks a 180px image + content in normal
              flow, so it must size to content (auto) — forcing 300 here is what
              clipped the light-mode details. */}
          <Box
            sx={{
              position: "relative",
              ...(theme.palette.mode === "dark"
                ? { height: open ? 140 : 300 }
                : {}),
            }}
          >
            {/* Same corner-stack approach as ListingCardV2 so the group card's
                chips can't collide either (quality and OUT OF STOCK previously
                shared top-right via a hand-computed 26px offset). */}
            <Box sx={cardChipStackSx("top-left")}>
              <Chip
                icon={<GroupsRounded sx={{ fontSize: "0.8rem !important" }} />}
                label={t("MarketRedesign.sellersCount", "{{count}} sellers", {
                  count: sellerCount,
                })}
                variant="outlined"
                size="small"
                sx={{
                  ...CARD_CHIP_SX,
                  ...NEUTRAL_CARD_CHIP_SX,
                  textTransform: "none",
                }}
              />
              {anyBulkDiscount && (
                <TagChip
                  tag="discount"
                  label={t("market.bulkDiscount", "BULK DISCOUNT")}
                  sx={CARD_CHIP_SX}
                />
              )}
            </Box>
            <Box sx={cardChipStackSx("top-right")}>
              {qc && (
                <Chip
                  label={qc.label}
                  size="small"
                  sx={{
                    ...CARD_CHIP_SX,
                    textTransform: "none",
                    ...qualityChipSx(qc.color),
                  }}
                />
              )}
              {allOutOfStock && (
                <Chip
                  label={t("market.outOfStock", "OUT OF STOCK")}
                  color="error"
                  size="small"
                  sx={CARD_CHIP_SX}
                />
              )}
            </Box>
            {/* Match ListingCardV2 exactly: dark mode = full-bleed image with a
                gradient scrim and text overlaid at the bottom; light mode = a
                fixed-height image with the text in normal flow BELOW it (no
                overlay, no gradient). The earlier version forced the dark
                overlay in light mode, which clipped the details. */}
            <CardMedia
              component="img"
              loading="lazy"
              // Intrinsic 16:9 size (CSS sets the displayed size).
              width={320}
              height={180}
              fetchPriority={priority ? "high" : undefined}
              image={cheapest.photo || FALLBACK_IMAGE_URL}
              sx={{
                width: "100%",
                objectFit: "cover",
                ...(theme.palette.mode === "dark"
                  ? { height: "100%", aspectRatio: "16/9" }
                  : { height: 180, aspectRatio: "16/9" }),
                overflow: "hidden",
              }}
              alt={t("marketV2.imageOf", { name: cheapest.game_item_name })}
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
                  ? { position: "absolute", bottom: 0, left: 0, zIndex: 4 }
                  : {}),
                width: "100%",
                maxWidth: "100%",
                padding: "8px 12px !important",
              }}
            >
              {/* Mirror ListingCardV2: price (h6) → item name (title) → seller
                  line. Only the seller line and the expand pill differ, so the
                  tile reads as a normal listing with a clear "expandable" cue. */}
              <Typography
                variant="h6"
                color="primary"
                fontWeight={600}
                noWrap
                sx={{ ...NUMERIC_SX, fontSize: "0.95rem", mb: 0.5 }}
              >
                {t("MarketRedesign.fromPrice", "from")} {fmt.price(priceMin)}
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
                {cheapest.game_item_name}
              </Typography>
              {/* Seller line + clear expand pill on one row */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: "0.7rem", lineHeight: 1.2, minWidth: 0 }}
                >
                  {t(
                    "MarketRedesign.acrossSellers",
                    "across {{count}} sellers",
                    {
                      count: sellerCount,
                    },
                  )}
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.25}
                  sx={{
                    flexShrink: 0,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 999,
                    bgcolor: open ? "action.selected" : "action.hover",
                    color: open ? "text.secondary" : "text.primary",
                    transition: "background-color .2s, color .2s",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                >
                  {open
                    ? t("MarketRedesign.hide", "Hide")
                    : t("MarketRedesign.compare", "Compare")}
                  <ExpandMoreRounded
                    sx={{
                      fontSize: "1rem",
                      transform: open ? "rotate(180deg)" : "none",
                      transition: "transform .2s",
                    }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Box>
        </CardActionArea>

        {/* Expanded seller comparison */}
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ p: 1.5 }}>
            {/* GroupSellers prints this summary from what it fetched (all
                sellers), so it always counts the cards it shows. */}
            {!cheapest.game_item_id && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 1.5 }}
              >
                {fmt.priceRange(priceMin, priceMax)} {"·"}{" "}
                {t("MarketRedesign.sellersCount", "{{count}} sellers", {
                  count: sellerCount,
                })}{" "}
                {"·"}{" "}
                {t(
                  "MarketRedesign.unitsAvailable",
                  "{{count}} units available",
                  { count: totalQuantity },
                )}
              </Typography>
            )}

            {/* Sell side — who's offering this item */}
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {t("MarketRedesign.forSale", "For sale")}
            </Typography>
            {/* Sell side — one row per VARIANT (quality tier), the unit buyers
                actually add to cart. Fetched server-side by game_item_id so it's
                complete (all sellers, all variants), not limited to the search
                page. Falls back to the client-grouped listings if no id. */}
            {cheapest.game_item_id ? (
              <GroupSellers
                gameItemId={cheapest.game_item_id}
                gameItemName={cheapest.game_item_name}
              />
            ) : (
              <GroupSellersFallback listings={listings} />
            )}

            {/* Buy side — who WANTS this item (EVE-style market depth: asks + bids
                side by side). Only render when the group carries a game_item_id
                (now provided by the search result) — that's the query key. */}
            {cheapest.game_item_id && (
              <GroupBuyOrders gameItemId={cheapest.game_item_id} />
            )}
          </Box>
        </Collapse>
      </Card>
    </Fade>
  )
}
