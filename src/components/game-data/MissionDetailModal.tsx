/**
 * MissionDetailModal — thin dialog wrapper around shared MissionDetailContent.
 */

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Alert,
} from "@mui/material"
import { Close } from "@mui/icons-material"
import { useGetMissionDetailQuery } from "../../store/api/v2/market"
import { MissionName } from "./MissionName"
import { MissionHeaderChips, MissionDetailTabs } from "./MissionDetailContent"
import { DetailSkeleton } from "./GameDataSkeletons"

interface MissionDetailModalProps {
  missionId: string | null
  open: boolean
  onClose: () => void
  onBlueprintClick?: (blueprintId: string) => void
}

export function MissionDetailModal({ missionId, open, onClose, onBlueprintClick }: MissionDetailModalProps) {
  const { data, isLoading, error } = useGetMissionDetailQuery(
    { missionId: missionId! },
    { skip: !missionId },
  )

  const m = data?.mission

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" noWrap sx={{ flex: 1 }}>
          <MissionName name={m?.mission_name} variant="inherit" />
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      {m && (
        <Box sx={{ px: 3, pb: 1 }}>
          <MissionHeaderChips mission={m} />
        </Box>
      )}

      <DialogContent sx={{ minHeight: 400 }}>
        {isLoading && <DetailSkeleton />}
        {error && <Alert severity="error">Failed to load mission.</Alert>}
        {data && <MissionDetailTabs data={data} onBlueprintClick={onBlueprintClick} />}
      </DialogContent>
    </Dialog>
  )
}
