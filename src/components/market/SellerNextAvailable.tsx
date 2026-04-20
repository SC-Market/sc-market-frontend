import React from "react"
import { Chip } from "@mui/material"
import { AccessTimeRounded, CheckCircleRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

/**
 * Displays when a seller is next available in the user's local timezone.
 * Shows nothing if no availability data, a green "Available now" chip if currently available,
 * or an outlined chip with the next available time.
 */
export function SellerNextAvailable(props: {
  nextAvailable?: string | null
}) {
  const { t, i18n } = useTranslation()
  const { nextAvailable } = props

  if (nextAvailable === undefined) return null

  if (nextAvailable === null) {
    return (
      <Chip
        icon={<CheckCircleRounded />}
        label={t("cart.availableNow", "Available now")}
        color="success"
        size="small"
        variant="outlined"
      />
    )
  }

  const date = new Date(nextAvailable)
  const formatted = date.toLocaleString(i18n.language, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })

  return (
    <Chip
      icon={<AccessTimeRounded />}
      label={`${t("cart.nextAvailable", "Next available")}: ${formatted}`}
      size="small"
      variant="outlined"
    />
  )
}
