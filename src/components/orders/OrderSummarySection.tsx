import { Box, Typography, Divider, Stack, Link } from "@mui/material"
import { OfferMarketListing } from "../../store/offer"
import { useTranslation } from "react-i18next"

interface OrderSummarySectionProps {
  market_listings?: OfferMarketListing[]
  total_cost: number
}

export function OrderSummarySection({
  market_listings,
  total_cost,
}: OrderSummarySectionProps) {
  const { t } = useTranslation()

  if (!market_listings || market_listings.length === 0) {
    return null
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        {t("orderSummary.title", "Order Summary")}
      </Typography>
      <Stack spacing={1}>
        {market_listings.map(({ listing, quantity }) => {
          const subtotal = quantity * +listing.listing.price
          return (
            <Box
              key={listing.listing.listing_id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Link
                  href={`/market/${listing.listing.listing_id}`}
                  sx={{ textDecoration: "none" }}
                >
                  {listing.details.title}
                </Link>
                <Typography variant="body2" color="text.secondary">
                  {(+listing.listing.price).toLocaleString()} aUEC × {quantity}
                </Typography>
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
          <Typography variant="h6">
            {t("orderSummary.total", "Total")}
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {total_cost.toLocaleString()} aUEC
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
