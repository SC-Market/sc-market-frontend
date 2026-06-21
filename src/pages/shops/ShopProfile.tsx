import { useParams } from "react-router-dom"
import { Box, Typography, Avatar, Rating, Chip, Skeleton, Container } from "@mui/material"
import { useGetShopQuery, useSearchListingsQuery } from "../../store/api/v2/market"
import { ListingTableV2 } from "../../features/market/v2/components/ListingTableV2"

export function ShopProfile() {
  const { slug } = useParams<{ slug: string }>()
  const { data: shop, isLoading, error } = useGetShopQuery({ slug: slug! }, { skip: !slug })
  const { data: listings } = useSearchListingsQuery(
    { shopSlug: slug!, pageSize: 20 },
    { skip: !slug },
  )

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
          <Skeleton variant="circular" width={64} height={64} />
          <Skeleton width={200} height={40} />
        </Box>
      </Container>
    )
  }

  if (error || !shop) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">Shop not found</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {shop.banner_url && (
        <Box
          sx={{
            width: "100%",
            height: 200,
            borderRadius: 2,
            overflow: "hidden",
            mb: 2,
          }}
        >
          <img
            src={shop.banner_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar
          src={shop.logo_url || undefined}
          sx={{ width: 64, height: 64 }}
        >
          {shop.name[0]}
        </Avatar>
        <Box>
          <Typography variant="h4">{shop.name}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Rating value={shop.rating || 0} precision={0.5} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              ({shop.rating_count} reviews)
            </Typography>
          </Box>
        </Box>
      </Box>

      {shop.description && (
        <Typography variant="body1" sx={{ mb: 3 }}>
          {shop.description}
        </Typography>
      )}

      {shop.supported_languages.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.5, mb: 3 }}>
          {shop.supported_languages.map((lang) => (
            <Chip key={lang} label={lang.toUpperCase()} size="small" variant="outlined" />
          ))}
        </Box>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>
        Listings
      </Typography>

      {listings && listings.listings.length > 0 ? (
        <ListingTableV2 listings={listings.listings} />
      ) : (
        <Typography color="text.secondary">No active listings</Typography>
      )}
    </Container>
  )
}
