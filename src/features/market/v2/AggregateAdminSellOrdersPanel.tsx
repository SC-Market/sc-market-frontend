import { useCallback, useMemo, useState } from "react"
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useCookies } from "react-cookie"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { ListingNameAndRating } from "../../../components/rating/ListingRating"
import type { Cart } from "../../../datatypes/Cart"
import { type AggregateListingV2Row } from "./aggregateV2Types"
import { SellYoursButton } from "../quick-list/SellYours"
import { useFormatters } from "../../../util/format"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"

// ---------------------------------------------------------------------------
// Add-to-cart dialog (sell orders)
// ---------------------------------------------------------------------------

export function BuyDialog({
  listing,
  open,
  onClose,
}: {
  listing: AggregateListingV2Row | null
  open: boolean
  onClose: () => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [cookies, setCookie] = useCookies(["market_cart"])
  const [quantity, setQuantity] = useState(1)

  const addToCart = useCallback(() => {
    if (!listing) return
    const cart: Cart = cookies.market_cart || []
    let found = false
    for (const seller of cart) {
      const matches = seller.shop_id && seller.shop_id === listing.shop_id
      if (matches) {
        seller.items.push({
          listing_id: listing.listing_id,
          aggregate_id: listing.listing_id,
          quantity,
          type: "aggregate_composite",
        })
        found = true
        break
      }
    }
    if (!found) {
      cart.push({
        shop_id: listing.shop_id,
        items: [
          {
            listing_id: listing.listing_id,
            aggregate_id: listing.listing_id,
            quantity,
            type: "aggregate_composite",
          },
        ],
      })
    }
    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000,
    })
    issueAlert({
      message: t("MarketAggregateView.addedToCart"),
      severity: "success",
    })
    onClose()
  }, [listing, cookies, quantity, setCookie, issueAlert, t, onClose])

  if (!listing) return null

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      title={t("marketUi.aggregateAdmin.buyFrom", { shop: listing.shop_name })}
      actions={
        <>
          <Button onClick={onClose}>{t("common.cancel", "Cancel")}</Button>
          <Button variant="contained" color="success" onClick={addToCart}>
            {t("MarketAggregateView.addToCart", "Add to Cart")}
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary" mt={1.5} mb={2}>
        {t("marketUi.aggregateAdmin.priceAndAvailable", {
          price: fmt.number(listing.price_min),
          available: fmt.number(listing.quantity_available),
        })}
      </Typography>
      <NumericFormat
        decimalScale={0}
        allowNegative={false}
        customInput={TextField}
        thousandSeparator
        fullWidth
        label={t("MarketAggregateView.quantityToBuy")}
        value={quantity}
        onValueChange={(v) => setQuantity(v.floatValue || 1)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {t("marketUi.aggregateAdmin.ofMax", {
                max: fmt.number(listing.quantity_available),
              })}
            </InputAdornment>
          ),
        }}
        isAllowed={({ floatValue }) =>
          !floatValue ||
          (floatValue >= 1 && floatValue <= listing.quantity_available)
        }
        sx={{ mb: 1.5 }}
      />
      <Typography
        variant="body2"
        color="primary"
        sx={{ fontFamily: "monospace" }}
      >
        {t("marketUi.aggregateAdmin.totalAuec", {
          total: fmt.number(listing.price_min * quantity),
        })}
      </Typography>
    </ResponsiveDialog>
  )
}

// ---------------------------------------------------------------------------
// Sell orders panel
// ---------------------------------------------------------------------------

export function SellOrdersPanel({
  listings,
  totalCount,
}: {
  listings: AggregateListingV2Row[]
  totalCount: number
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const [buyTarget, setBuyTarget] = useState<AggregateListingV2Row | null>(null)
  const sorted = useMemo(
    () =>
      [...listings]
        .filter((l) => l.quantity_available > 0)
        .sort((a, b) => a.price_min - b.price_min),
    [listings],
  )
  const bestAsk = sorted[0]?.price_min

  return (
    <Box>
      {/* Column headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 80px 80px",
          px: 3,
          py: 0.75,
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {[
          t("marketUi.aggregateAdmin.colSeller"),
          t("marketUi.aggregateAdmin.colQuality"),
          t("marketUi.aggregateAdmin.colPricePerUnit"),
          t("marketUi.aggregateAdmin.colStock"),
          "",
        ].map((h, i) => (
          <Typography
            key={i}
            variant="caption"
            fontWeight={700}
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "text.secondary",
              textAlign: i >= 2 ? "right" : "left",
            }}
          >
            {h}
          </Typography>
        ))}
      </Box>

      {sorted.length === 0 && totalCount === 0 ? (
        // Nobody sells it: invite the visitor to be the first
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ px: 3, py: 3, textAlign: "center" }}
        >
          <Typography color="text.secondary" fontWeight={700}>
            {t("quickList.empty.title", "Nobody is selling this right now")}
          </Typography>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ maxWidth: 360 }}
          >
            {t(
              "quickList.empty.body",
              "Have one? List it with Quick List. Buyers watching its price get an alert when it fits their target.",
            )}
          </Typography>
          <SellYoursButton variant="contained" />
        </Stack>
      ) : sorted.length === 0 ? (
        <Box sx={{ px: 3, py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t("marketUi.aggregateAdmin.noSellOrders")}
          </Typography>
        </Box>
      ) : (
        sorted.slice(0, 10).map((listing) => {
          const isBest = listing.price_min === bestAsk
          return (
            <Box
              key={listing.listing_id}
              onClick={() => setBuyTarget(listing)}
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 80px 80px",
                px: 3,
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                borderLeft: "2px solid",
                borderLeftColor: isBest ? "success.main" : "transparent",
                cursor: "pointer",
                transition: "background 0.1s",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {/* Seller — use ListingNameAndRating */}
              <ListingNameAndRating
                shop={{
                  name: listing.shop_name,
                  slug: listing.shop_slug,
                  rating: listing.shop_rating,
                }}
              />

              {/* Quality — use QualityBadge */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {listing.quality_tier_min || listing.quality_tier_max ? (
                  <>
                    <QualityBadge
                      tier={listing.quality_tier_min}
                      size="small"
                    />
                    {listing.quality_tier_min !== listing.quality_tier_max &&
                      listing.quality_tier_max && (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            –
                          </Typography>
                          <QualityBadge
                            tier={listing.quality_tier_max}
                            size="small"
                          />
                        </>
                      )}
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {t("marketUi.aggregateAdmin.anyQuality")}
                  </Typography>
                )}
              </Box>

              {/* Price */}
              <Stack alignItems="flex-end">
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "success.main",
                  }}
                >
                  {fmt.number(listing.price_min)}
                </Typography>
                {isBest && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "monospace", fontSize: "10px" }}
                  >
                    {t("marketUi.aggregateAdmin.bestAskLower")}
                  </Typography>
                )}
              </Stack>

              {/* Stock */}
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  textAlign: "right",
                  alignSelf: "center",
                }}
              >
                {fmt.number(listing.quantity_available)}
              </Typography>

              {/* Action */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setBuyTarget(listing)
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  sx={{
                    fontSize: "10px",
                    fontWeight: 700,
                    minWidth: 0,
                    px: 1.5,
                    py: 0.25,
                    letterSpacing: "0.05em",
                  }}
                >
                  {t("marketUi.aggregateAdmin.buy")}
                </Button>
              </Box>
            </Box>
          )
        })
      )}

      {totalCount > 10 && (
        <Box
          sx={{
            px: 3,
            py: 1.25,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("marketUi.aggregateAdmin.showingOf", {
              shown: 10,
              total: totalCount,
            })}
          </Typography>
          <Button size="small" color="inherit" sx={{ fontSize: "11px" }}>
            {t("marketUi.aggregateAdmin.loadMore")}
          </Button>
        </Box>
      )}

      <BuyDialog
        listing={buyTarget}
        open={!!buyTarget}
        onClose={() => setBuyTarget(null)}
      />
    </Box>
  )
}
