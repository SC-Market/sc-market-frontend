import { Chip, Tooltip } from "@mui/material"
import { formatDistanceToNow } from "date-fns"
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded"
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded"

interface SellerStatusBadgeProps {
  inGame?: boolean
  lastSeen?: string | Date
  membersOnline?: number
  compact?: boolean
}

export function SellerStatusBadge({
  inGame,
  lastSeen,
  membersOnline,
  compact,
}: SellerStatusBadgeProps) {
  // For contractors, show members online count
  if (membersOnline !== undefined && membersOnline > 0) {
    return (
      <Chip
        icon={<SportsEsportsRoundedIcon />}
        label={compact ? membersOnline : `${membersOnline} online`}
        size="small"
        color="success"
        sx={{ fontWeight: 600 }}
      />
    )
  }

  // For individual users, show in-game status
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
