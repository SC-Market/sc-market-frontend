import { Chip, Tooltip } from "@mui/material"
import { formatDistanceToNow } from "date-fns"
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded"
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded"

interface SellerStatusBadgeProps {
  inGame?: boolean
  lastSeen?: string | Date
  compact?: boolean
}

export function SellerStatusBadge({
  inGame,
  lastSeen,
  compact,
}: SellerStatusBadgeProps) {
  if (inGame) {
    return (
      <Chip
        icon={<SportsEsportsRoundedIcon />}
        label={compact ? undefined : "In Game"}
        size="small"
        color="success"
        sx={{ fontWeight: 600 }}
      />
    )
  }

  if (!lastSeen) return null

  const lastSeenDate = new Date(lastSeen)
  const lastSeenText = formatDistanceToNow(lastSeenDate, { addSuffix: true })

  return (
    <Tooltip title={`Last active ${lastSeenText}`}>
      <Chip
        icon={<AccessTimeRoundedIcon />}
        label={compact ? undefined : `Active ${lastSeenText}`}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  )
}
