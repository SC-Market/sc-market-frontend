import React from "react"
import { Link as RouterLink } from "react-router-dom"
import { Box, Grid, Card, CardContent, Avatar, Typography, Rating, Skeleton, Chip } from "@mui/material"
import { useGetShopsByOwnerQuery } from "../../../store/api/v2/market"

export function ProfileStoreView(props: { user: string }) {
  return <ShopList username={props.user} />
}

export function OrgStoreView(props: { org: string }) {
  return <ShopList spectrumId={props.org} />
}

function ShopList(props: { username?: string; spectrumId?: string }) {
  const { data: shops, isLoading } = useGetShopsByOwnerQuery({
    username: props.username,
    spectrumId: props.spectrumId,
  })

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2].map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (!shops || shops.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        No shops yet
      </Typography>
    )
  }

  return (
    <Grid container spacing={2}>
      {shops.map((shop) => (
        <Grid item xs={12} sm={6} md={4} key={shop.shop_id}>
          <Card
            component={RouterLink}
            to={`/shops/${shop.slug}`}
            sx={{ textDecoration: "none", "&:hover": { boxShadow: 4 }, transition: "box-shadow 0.2s" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Avatar src={shop.logo_url || undefined} sx={{ width: 48, height: 48 }}>
                  {shop.name[0]}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" noWrap>{shop.name}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Rating value={shop.rating || 0} precision={0.5} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      ({shop.rating_count})
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {shop.description && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {shop.description}
                </Typography>
              )}
              {shop.supported_languages.length > 1 && (
                <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                  {shop.supported_languages.slice(0, 4).map((lang) => (
                    <Chip key={lang} label={lang.toUpperCase()} size="small" variant="outlined" sx={{ height: 20 }} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
