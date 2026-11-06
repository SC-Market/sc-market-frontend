import React from "react"
import { Box, CircularProgress } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetLocationDetailQuery } from "../../store/api/v2/market"
import { LocationDetailContent } from "./LocationDetailContent"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Props {
  locationName: string | null
  open: boolean
  onClose: () => void
}

export function MiningLocationDetailModal({
  locationName,
  open,
  onClose,
}: Props) {
  const { t } = useTranslation()
  const { data: loc, isLoading } = useGetLocationDetailQuery(
    { name: locationName! },
    { skip: !locationName },
  )

  const displayName = loc
    ? loc.displayName || friendlyName(loc.name)
    : friendlyName(locationName || "")

  return (
    // Desktop only: on narrow screens the browser opens the detail page
    // instead, so this stays a centred dialog at every width.
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      mobile="dialog"
      dividers
      title={displayName}
      closeLabel={t("accessibility.close")}
    >
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {loc && <LocationDetailContent location={loc} />}
    </ResponsiveDialog>
  )
}
