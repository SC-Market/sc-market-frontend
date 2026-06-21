import React from "react"
import { Grid, Skeleton, Typography } from "@mui/material"
import { useGetShopsByOwnerQuery } from "../../../store/api/v2/market"
import { ShopCard } from "../../shops/components/ShopCard"

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
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
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
      {shops.map((shop, index) => (
        <Grid item xs={12} sm={6} md={4} key={shop.shop_id}>
          <ShopCard shop={shop} index={index} />
        </Grid>
      ))}
    </Grid>
  )
}
