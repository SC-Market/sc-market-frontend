import { Box, Typography, Divider, Stack, Link, Chip } from "@mui/material"
import { OfferMarketListing } from "../../features/offers/api/offerApi"
import { useTranslation } from "react-i18next"
import { OfferChanges } from "../../util/offerChanges"
import { formatMarketUrl } from "../../features/market/domain/urls"
import { useFormatters } from "../../util/format"

interface OrderSummarySectionProps {
  market_listings?: OfferMarketListing[]
  total_cost: number
  offerChanges?: OfferChanges | null
}

export function OrderSummarySection({
  market_listings,
  offerChanges,
}: OrderSummarySectionProps) {
  const fmt = useFormatters()
  const { t } = useTranslation()

  if (!market_listings || market_listings.length === 0) {
    return null
  }

  const listingsTotal = market_listings.reduce(
    (sum, { listing, quantity }) => sum + quantity * +listing.listing.price,
    0,
  )

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }} />
      {t("orderSummary.title", "Order Summary")}
      <Stack spacing={1} sx={{ mt: 1 }}>
        {market_listings.map(({ listing, quantity }) => {
          const subtotal = quantity * +listing.listing.price
          const isNew = offerChanges?.addedListings.has(
            listing.listing.listing_id,
          )
          const quantityChange = offerChanges?.quantityChanges.get(
            listing.listing.listing_id,
          )

          return (
            <Box
              key={listing.listing.listing_id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box>
                  <Link
                    href={formatMarketUrl({
                      listing_id: listing.listing.listing_id,
                      title: listing.details.title,
                    })}
                    sx={{ textDecoration: "none" }}
                  >
                    {listing.details.title}
                  </Link>
                  <Typography variant="body2" color="text.secondary">
                    {fmt.number(+listing.listing.price)} aUEC × {quantity}
                    {quantityChange && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="primary"
                        sx={{ ml: 0.5 }}
                      >
                        {t("ordersUi.summary.wasQuantity", {
                          quantity: quantityChange.old,
                        })}
                      </Typography>
                    )}
                  </Typography>
                </Box>
                {(isNew || quantityChange) && (
                  <Chip
                    label={t("ordersUi.summary.newBadge")}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {fmt.number(subtotal)} aUEC
              </Typography>
            </Box>
          )
        })}
        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {t("orderSummary.total", "Total")}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight="bold"
          >
            {fmt.number(listingsTotal)}{" "}
            <Typography
              variant="subtitle2"
              color="text.primary"
              display="inline"
              fontWeight="bold"
            >
              aUEC
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
