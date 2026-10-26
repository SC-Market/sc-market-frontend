import React from "react"
import { Button, Skeleton } from "@mui/material"
import {
  NotificationsActiveRounded,
  NotificationAddRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useSession } from "../../../hooks/login/useSession"
import { useGetWatchlistQuery } from "../../../store/api/v2/market"
import { PATHS } from "../../../routes/paths"
import { WatchPriceDialog } from "./WatchPriceDialog"
import { formatAuec } from "../domain/price"

export interface WatchPriceButtonProps {
  gameItemId: string
  itemName: string
  /** Current lowest price; prefills the target price. */
  currentPrice?: number | null
  size?: "small" | "medium"
}

/**
 * "Watch price" for a game item: opens a dialog to set a target price. When
 * the item is already watched it shows "Watching ≤ X aUEC" and edits that
 * watch. Logged-out visitors are sent to log in first.
 */
export function WatchPriceButton({
  gameItemId,
  itemName,
  currentPrice,
  size = "small",
}: WatchPriceButtonProps) {
  const { t } = useTranslation()
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = React.useState(false)
  const loggedIn = session.status === "authenticated"
  const { data, isLoading } = useGetWatchlistQuery(undefined, {
    skip: !loggedIn,
  })
  const existing = data?.items.find((i) => i.game_item_id === gameItemId)

  if (session.status === "unknown" || (loggedIn && isLoading)) {
    return (
      <Skeleton
        variant="rounded"
        width={140}
        height={size === "small" ? 30 : 36}
        data-testid="watch-price-loading"
      />
    )
  }

  const onClick = () => {
    if (!loggedIn) {
      const back = `${location.pathname}${location.search}`
      navigate(`${PATHS.login}?redirect=${encodeURIComponent(back)}`)
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button
        size={size}
        variant={existing ? "contained" : "outlined"}
        color={existing ? "success" : "primary"}
        startIcon={
          existing ? <NotificationsActiveRounded /> : <NotificationAddRounded />
        }
        onClick={onClick}
      >
        {existing
          ? t("priceAlerts.watch.watching", "Watching ≤ {{price}}", {
              price: formatAuec(existing.max_price),
            })
          : t("priceAlerts.watch.button", "Watch price")}
      </Button>
      {loggedIn && (
        <WatchPriceDialog
          open={open}
          onClose={() => setOpen(false)}
          gameItemId={gameItemId}
          itemName={itemName}
          currentPrice={existing?.current_lowest ?? currentPrice}
          existing={existing}
        />
      )}
    </>
  )
}
