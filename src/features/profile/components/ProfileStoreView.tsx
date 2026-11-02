import React from "react"
import { Grid, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetShopsByOwnerQuery } from "../../../store/api/v2/market"
import { ShopCard } from "../../shops/components/ShopCard"
import {
  OWNER_SHOP_GRID_BREAKPOINTS,
  ShopListSkeleton,
} from "../../../components/skeletons/ShopCardSkeleton"

export function ProfileStoreView(props: { user: string }) {
  return <ShopList username={props.user} />
}

export function OrgStoreView(props: { org: string }) {
  return <ShopList spectrumId={props.org} />
}

function ShopList(props: { username?: string; spectrumId?: string }) {
  const { t } = useTranslation()
  const { data: shops, isLoading } = useGetShopsByOwnerQuery({
    username: props.username,
    spectrumId: props.spectrumId,
  })

  if (isLoading) {
    return <ShopListSkeleton />
  }

  if (!shops || shops.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        {t("accountUi.noShopsYet")}
      </Typography>
    )
  }

  return (
    <Grid container spacing={2}>
      {shops.map((shop, index) => (
        <Grid item {...OWNER_SHOP_GRID_BREAKPOINTS} key={shop.shop_id}>
          <ShopCard shop={shop} index={index} />
        </Grid>
      ))}
    </Grid>
  )
}
