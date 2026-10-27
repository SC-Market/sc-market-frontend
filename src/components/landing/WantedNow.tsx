import React, { useMemo } from "react"
import { Box, Button, Paper, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useSearchBuyOrdersQuery } from "../../store/api/v2/market"
import {
  BuyOrderAggregateCard,
  groupBuyOrdersByItem,
} from "../../features/market/v2/BuyOrderAggregateCard"
import { MARKET_PATHS } from "../../routes/paths"
import { usePageReady } from "../metadata/PageReady"
import { isPrimaryLoading } from "../metadata/pageReadyStore"
import {
  BUY_ORDER_CARD_HEIGHT,
  WANTED_NOW_COUNT,
  WantedNowLayout,
  WantedNowSkeleton,
} from "./WantedNow.skeleton"

/**
 * "Wanted now": the newest open buy orders as /buyorders cards (grouped by
 * item, the same card), so sellers see live demand. A fixed-height rail:
 * loading, loaded, empty and failed states are all one card tall.
 */
export function WantedNow() {
  const { t } = useTranslation()
  const result = useSearchBuyOrdersQuery({
    page: 1,
    pageSize: WANTED_NOW_COUNT,
    sortBy: "created_at",
    sortOrder: "desc",
  })
  usePageReady(isPrimaryLoading(result))
  const aggregates = useMemo(
    () => groupBuyOrdersByItem(result.data?.buy_orders ?? []),
    [result.data],
  )

  if (result.isLoading) return <WantedNowSkeleton />

  return (
    <WantedNowLayout>
      {aggregates.length > 0 ? (
        aggregates.map((aggregate, index) => (
          <BuyOrderAggregateCard
            key={aggregate.item_id}
            aggregate={aggregate}
            index={index}
            useFixedWidth
            showOrderDetails
          />
        ))
      ) : (
        <Paper
          sx={{
            flex: 1,
            height: BUY_ORDER_CARD_HEIGHT,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            {result.isError
              ? t("landing.wantedNowError")
              : t("landing.wantedNowEmpty")}
          </Typography>
          <Box>
            <Button
              component={Link}
              to={MARKET_PATHS.buyOrderCreate}
              variant="contained"
              color="secondary"
            >
              {t("landing.intentWantedAction")}
            </Button>
          </Box>
        </Paper>
      )}
    </WantedNowLayout>
  )
}

export default WantedNow
