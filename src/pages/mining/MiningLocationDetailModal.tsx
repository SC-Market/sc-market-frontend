import React from "react"
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, CircularProgress } from "@mui/material"
import { Close } from "@mui/icons-material"
import { useGetLocationDetailQuery } from "../../store/api/v2/market"
import { LocationDetailContent } from "./LocationDetailContent"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Props {
  locationName: string | null
  open: boolean
  onClose: () => void
}

export function MiningLocationDetailModal({ locationName, open, onClose }: Props) {
  const { data: loc, isLoading } = useGetLocationDetailQuery(
    { name: locationName! },
    { skip: !locationName },
  )

  const displayName = loc ? (loc.displayName || friendlyName(loc.name)) : friendlyName(locationName || "")

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">{displayName}</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        )}
        {loc && <LocationDetailContent location={loc} />}
      </DialogContent>
    </Dialog>
  )
}
