import React from "react"
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Stack, Box, CircularProgress } from "@mui/material"
import { Close } from "@mui/icons-material"
import { useGetOreDetailQuery } from "../../store/api/v2/market"
import { OreDetailContent } from "./OreDetailContent"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Props {
  oreName: string | null
  open: boolean
  onClose: () => void
}

export function MiningOreDetailModal({ oreName, open, onClose }: Props) {
  const { data: ore, isLoading } = useGetOreDetailQuery(
    { name: oreName! },
    { skip: !oreName },
  )

  const displayName = ore ? (ore.displayName || friendlyName(ore.name)) : friendlyName(oreName || "")

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
        {ore && <OreDetailContent ore={ore} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
