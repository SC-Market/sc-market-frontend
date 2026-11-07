import { RefreshRounded } from "@mui/icons-material"
import { IconButton, Tooltip } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useFormatters } from "../../../util/format"
import { useRefreshListing } from "../hooks/useStockListingActions"

/** Listings can be renewed within this window before expiry (backend NOTICE_DAYS_BEFORE). */
const RENEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

/** The stock grid's expiry cell: time left, or a renew button near or past expiry. */
export function ListingRenewCell({
  expiresAt,
  status,
  listingId,
  canManage,
  handleRefresh,
}: {
  expiresAt: string | null | undefined
  status: string
  listingId: string
  canManage: boolean
  handleRefresh: ReturnType<typeof useRefreshListing>
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const paused = status === "expired"
  if (!expiresAt && !paused) return "—"
  if (!canManage) return "—"
  // Renewable: paused (expired) or within the 3-day notice window.
  // Renew starts a new month and reactivates a paused listing.
  const msLeft = expiresAt ? new Date(expiresAt).getTime() - Date.now() : 0
  if (!paused && msLeft > RENEW_WINDOW_MS)
    return fmt.timeUntil(expiresAt, Date.now())
  // An active listing long past its date: a date migrated from V1
  // that nothing enforces (listing expiry is off), not renewable.
  if (!paused && msLeft < -RENEW_WINDOW_MS) return "—"
  const label = paused
    ? t("ItemStock.reactivateListing", "Paused: renew and reactivate")
    : t("ItemStock.renewListing", "Expires soon: renew for another month")
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        sx={{
          color: paused || msLeft <= 0 ? "error.main" : "warning.main",
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleRefresh(listingId)
        }}
      >
        <RefreshRounded />
      </IconButton>
    </Tooltip>
  )
}
