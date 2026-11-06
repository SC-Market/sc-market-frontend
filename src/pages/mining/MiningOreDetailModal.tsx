import React from "react"
import { Box, CircularProgress } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetOreDetailQuery } from "../../store/api/v2/market"
import { OreDetailContent } from "./OreDetailContent"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Props {
  oreName: string | null
  open: boolean
  onClose: () => void
}

export function MiningOreDetailModal({ oreName, open, onClose }: Props) {
  const { t } = useTranslation()
  const { data: ore, isLoading } = useGetOreDetailQuery(
    { name: oreName! },
    { skip: !oreName },
  )

  const displayName = ore
    ? ore.displayName || friendlyName(ore.name)
    : friendlyName(oreName || "")

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
      {ore && <OreDetailContent ore={ore} onClose={onClose} />}
    </ResponsiveDialog>
  )
}
