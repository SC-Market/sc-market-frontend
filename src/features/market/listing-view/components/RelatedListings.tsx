import { useMemo } from "react"
import { Box, Grid, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useSearchMarketQuery } from "../../api/marketApi"
import { DisplayListingsHorizontal } from "../../views/ItemListings"
import { HorizontalListingSkeleton } from "../../../../components/skeletons"

export function RelatedListings(props: {
  itemType: string
  currentListingId: string
}) {
  const { t } = useTranslation()
  const { itemType, currentListingId } = props

  const searchParams = useMemo(
    () => ({
      index: 0,
      page_size: 8,
      quantityAvailable: 1,
      sort: "date-new",
      listing_type: "not-aggregate",
      item_type: itemType,
      user_seller: "",
      contractor_seller: "",
    }),
    [itemType],
  )

  const {
    data: results,
    isLoading,
    isFetching,
  } = useSearchMarketQuery(searchParams)

  const relatedListings = useMemo(() => {
    if (!results?.listings) return []
    return results.listings.filter((l) => l.listing_id !== currentListingId)
  }, [results?.listings, currentListingId])

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
            {t("MarketListingView.relatedListings", {
              category: itemType,
              defaultValue: `Related ${itemType} listings`,
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

  if (!relatedListings.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          gutterBottom
        >
          {t("MarketListingView.relatedListings", {
            category: itemType,
            defaultValue: `Related ${itemType} listings`,
          })}
        </Typography>
        <Box
          sx={{
            maxWidth: "100%",
            overflowX: "scroll",
            pb: 1,
          }}
        >
          <DisplayListingsHorizontal listings={relatedListings} />
        </Box>
      </Box>
    </Grid>
  )
}
