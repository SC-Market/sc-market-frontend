import React from "react"
import { Paper, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useBrowseShopsQuery } from "../../features/shops/api/shopsApi"
import { ShopCard } from "../../features/shops/components/ShopCard"
import { usePageReady } from "../metadata/PageReady"
import { isPrimaryLoading } from "../metadata/pageReadyStore"
import {
  TOP_RATED_SHOPS_ARGS,
  TOP_SHOP_CELL_HEIGHT,
  TopRatedShopsLayout,
  TopRatedShopsSkeleton,
  TopShopCell,
} from "./TopRatedShops.skeleton"

/**
 * "Top rated shops": the /shops directory's Top Rated sort among shops that
 * trade (TOP_RATED_SHOPS_ARGS), as its compact cards in fixed-height cells.
 */
export function TopRatedShops() {
  const { t } = useTranslation()
  const result = useBrowseShopsQuery(TOP_RATED_SHOPS_ARGS)
  usePageReady(isPrimaryLoading(result))

  if (result.isLoading) return <TopRatedShopsSkeleton />

  const shops = result.data?.shops ?? []
  return (
    <TopRatedShopsLayout>
      {shops.length > 0 ? (
        shops.map((shop, index) => (
          <TopShopCell key={shop.shop_id} slug={shop.slug}>
            <ShopCard shop={shop} index={index} compact />
          </TopShopCell>
        ))
      ) : (
        <Paper
          sx={{
            gridColumn: "1 / -1",
            height: TOP_SHOP_CELL_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Typography color="text.secondary">
            {result.isError
              ? t("landing.topShopsError")
              : t("landing.topShopsEmpty")}
          </Typography>
        </Paper>
      )}
    </TopRatedShopsLayout>
  )
}

export default TopRatedShops
