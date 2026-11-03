import React from "react"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Typography,
} from "@mui/material"
import {
  NotificationsActiveRounded,
  NotificationAddRounded,
  NotificationsPausedRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useSession } from "../../../hooks/login/useSession"
import { useGetWatchlistQuery } from "../../../store/api/v2/market"
import { PATHS } from "../../../routes/paths"
import { WatchPriceDialog } from "./WatchPriceDialog"

export interface WatchPriceButtonProps {
  gameItemId: string
  itemName: string
  /** Current lowest price; prefills the target price. */
  currentPrice?: number | null
  /** The item comes in quality tiers: the dialog offers a minimum quality. */
  qualityRelevant?: boolean
  size?: "small" | "medium"
}

/**
 * "Watch price" for a game item: opens a dialog to set a target price. When
 * the item is already watched it reads "Watching · Edit" (or "Paused · Edit")
 * and edits that watch. Signed-out visitors are asked to sign in first.
 */
export function WatchPriceButton({
  gameItemId,
  itemName,
  currentPrice,
  qualityRelevant,
  size = "small",
}: WatchPriceButtonProps) {
  const { t } = useTranslation()
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = React.useState(false)
  const [signInOpen, setSignInOpen] = React.useState(false)
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

  const signIn = () => {
    const back = `${location.pathname}${location.search}`
    navigate(`${PATHS.login}?redirect=${encodeURIComponent(back)}`)
  }

  const icon = !existing ? (
    <NotificationAddRounded />
  ) : existing.paused ? (
    <NotificationsPausedRounded />
  ) : (
    <NotificationsActiveRounded />
  )

  return (
    <>
      <Button
        size={size}
        variant={existing ? "contained" : "outlined"}
        color={existing && !existing.paused ? "success" : "primary"}
        startIcon={icon}
        onClick={() => (loggedIn ? setOpen(true) : setSignInOpen(true))}
      >
        {!existing
          ? t("priceAlerts.watch.button", "Watch price")
          : existing.paused
            ? t("priceAlerts.watch.pausedEdit", "Paused · Edit")
            : t("priceAlerts.watch.watchingEdit", "Watching · Edit")}
      </Button>
      {loggedIn ? (
        <WatchPriceDialog
          open={open}
          onClose={() => setOpen(false)}
          gameItemId={gameItemId}
          itemName={itemName}
          currentPrice={existing?.current_lowest ?? currentPrice}
          existing={existing}
          qualityRelevant={qualityRelevant}
        />
      ) : (
        <Dialog
          open={signInOpen}
          onClose={() => setSignInOpen(false)}
          maxWidth="xs"
          fullWidth
          aria-labelledby="watch-price-sign-in-title"
        >
          <DialogTitle id="watch-price-sign-in-title">
            {t("priceAlerts.signIn.title", "Sign in to watch prices")}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              {t(
                "priceAlerts.signIn.body",
                "Set a target price for {{name}} and get an alert when someone lists it at or below that price. Price alerts need an SC Market account.",
                { name: itemName },
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSignInOpen(false)}>
              {t("ui.cancel", "Cancel")}
            </Button>
            <Button variant="contained" onClick={signIn}>
              {t("priceAlerts.signIn.action", "Sign in")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
