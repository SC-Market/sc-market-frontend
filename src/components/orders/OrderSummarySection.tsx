import { Box, Typography, Divider, Stack, Link, Chip } from "@mui/material"
import { OfferMarketListing } from "../../store/offer"
import { useTranslation } from "react-i18next"
import { OfferChanges } from "../../util/offerChanges"

interface OrderSummarySectionProps {
  market_listings?: OfferMarketListing[]
  total_cost: number
  offerChanges?: OfferChanges | null
}

export function OrderSummarySection({
  market_listings,
  total_cost,
  offerChanges,
}: OrderSummarySectionProps) {
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
          const isNew = offerChanges?.addedListings.has(listing.listing.listing_id)
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
                    href={`/market/${listing.listing.listing_id}`}
                    sx={{ textDecoration: "none" }}
                  >
                    {listing.details.title}
                  </Link>
                  <Typography variant="body2" color="text.secondary">
                    {(+listing.listing.price).toLocaleString()} aUEC × {quantity}
                    {quantityChange && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="primary"
                        sx={{ ml: 0.5 }}
                      >
                        (was {quantityChange.old})
                      </Typography>
                    )}
                  </Typography>
                </Box>
                {(isNew || quantityChange) && (
                  <Chip label="NEW!" size="small" color="primary" />
                )}
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {subtotal.toLocaleString()} aUEC
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
          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
            {listingsTotal.toLocaleString()}{" "}
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
