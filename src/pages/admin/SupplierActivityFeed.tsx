import React from "react"
import { Box, Divider, Stack, Typography } from "@mui/material"
import {
  AssignmentRounded,
  PaymentsRounded,
  ShoppingCartRounded,
} from "@mui/icons-material"
import { Trans, useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import type {
  StandingBuyOrder,
  RequisitionDetail,
  OrderPreview,
} from "../../store/api/v2/market"
import { formatAuec, timeAgo } from "./supplierDashboardShared"

// ---------------------------------------------------------------------------
// Activity Feed (derived from available data)
// ---------------------------------------------------------------------------

export interface ActivityItem {
  id: string
  icon: React.ReactNode
  text: React.ReactNode
  time: string
}

export function buildActivityFeed(
  t: TFunction,
  buyOrders: StandingBuyOrder[],
  reqs: RequisitionDetail[],
  orders: OrderPreview[],
  locale: string,
): ActivityItem[] {
  const items: ActivityItem[] = []

  buyOrders
    .filter((o) => o.visibility === "private")
    .slice(0, 3)
    .forEach((o) => {
      items.push({
        id: `bo-${o.buy_order_id}`,
        icon: (
          <ShoppingCartRounded sx={{ fontSize: 16, color: "primary.main" }} />
        ),
        text: (
          <>
            <Trans
              i18nKey="suppliersUi.dashboard.activity.targetedBuyOrder"
              values={{ buyer: o.buyer_name, item: o.game_item_name }}
              components={{ b: <b /> }}
            />
          </>
        ),
        time: timeAgo(t, o.created_at),
      })
    })

  reqs
    .filter((r) => r.status === "not-started")
    .slice(0, 2)
    .forEach((r) => {
      items.push({
        id: `req-${r.order_id}`,
        icon: (
          <AssignmentRounded sx={{ fontSize: 16, color: "warning.main" }} />
        ),
        text: (
          <>
            <Trans
              i18nKey="suppliersUi.dashboard.activity.newRequisition"
              values={{
                title: r.title,
                buyer: r.buyer?.display_name ?? r.buyer?.username,
              }}
              components={{ b: <b /> }}
            />
          </>
        ),
        time: timeAgo(t, r.created_at),
      })
    })

  orders
    .filter((o) => o.status === "fulfilled")
    .slice(0, 2)
    .forEach((o) => {
      items.push({
        id: `ord-${o.order_id}`,
        icon: <PaymentsRounded sx={{ fontSize: 16, color: "success.main" }} />,
        text: (
          <>
            <Trans
              i18nKey="suppliersUi.dashboard.activity.orderCompleted"
              values={{
                title: o.title,
                amount: formatAuec(o.total_price, locale),
              }}
              components={{ b: <b /> }}
            />
          </>
        ),
        time: timeAgo(t, o.updated_at),
      })
    })

  return items.sort((a, b) => (a.time < b.time ? -1 : 1))
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const { t } = useTranslation()
  if (items.length === 0) {
    return (
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t("suppliersUi.dashboard.noActivity")}
        </Typography>
      </Box>
    )
  }
  return (
    <Stack divider={<Divider />}>
      {items.slice(0, 8).map((item) => (
        <Box key={item.id} sx={{ px: 2, py: 1.25 }}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box sx={{ mt: 0.25 }}>{item.icon}</Box>
            <Box flex={1}>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                {item.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.time}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
