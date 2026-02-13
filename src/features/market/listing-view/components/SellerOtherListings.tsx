import { useMemo } from "react"
import { Box, Grid, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useSearchMarketQuery } from "../../api/marketApi"
import { DisplayListingsHorizontal } from "../../views/ItemListings"
import { HorizontalListingSkeleton } from "../../../../components/skeletons"

export function SellerOtherListings(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
  currentListingId: string
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { userSeller, contractorSeller, currentListingId } = props

  const searchParams = useMemo(() => {
    if (!userSeller && !contractorSeller) return null

    return {
      index: 0,
      page_size: 8,
      quantityAvailable: 1,
      sort: "date-new",
      listing_type: "not-aggregate",
      user_seller: userSeller?.username || "",
      contractor_seller: contractorSeller?.spectrum_id || "",
    }
  }, [userSeller?.username, contractorSeller?.spectrum_id])

  const {
    data: results,
    isLoading,
    isFetching,
  } = useSearchMarketQuery(searchParams!, {
    skip: !searchParams,
  })

  const otherListings = useMemo(() => {
    if (!results?.listings) return []
    return results.listings.filter((l) => l.listing_id !== currentListingId)
  }, [results?.listings, currentListingId])

  const sellerName = userSeller?.username || contractorSeller?.spectrum_id || ""

  if (isLoading || isFetching) {
    return (
      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight="bold"
            gutterBottom
          >
            {t("MarketListingView.otherListingsFrom", {
              seller: sellerName,
              defaultValue: `Other listings from ${sellerName}`,
            })}
          </Typography>
          <Box
            sx={{
              maxWidth: "100%",
              overflowX: "scroll",
              pb: 1,
              display: "flex",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
              <HorizontalListingSkeleton key={index} index={index} />
            ))}
          </Box>
        </Box>
      </Grid>
    )
  }

  if (!otherListings.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          gutterBottom
        >
          {t("MarketListingView.otherListingsFrom", {
            seller: sellerName,
            defaultValue: `Other listings from ${sellerName}`,
          })}
        </Typography>
        <Box
          sx={{
            maxWidth: "100%",
            overflowX: "scroll",
            pb: 1,
          }}
        >
          <DisplayListingsHorizontal listings={otherListings} />
        </Box>
      </Box>
    </Grid>
  )
}
