import { Chip, Tooltip, Box } from "@mui/material"
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
  const lastSeenDate = lastSeen ? new Date(lastSeen) : null
  const lastSeenText = lastSeenDate
    ? formatDistanceToNow(lastSeenDate, { addSuffix: true })
    : null

  return (
    <Box display="flex" gap={0.5} alignItems="center">
      {/* Show online status if applicable */}
      {membersOnline !== undefined && membersOnline > 0 && (
        <Chip
          icon={<SportsEsportsRoundedIcon />}
          label={compact ? membersOnline : `${membersOnline} online`}
          size="small"
          color="success"
          sx={{ fontWeight: 600 }}
        />
      )}
      {inGame && (
        <Chip
          icon={<SportsEsportsRoundedIcon />}
          label={compact ? undefined : "In Game"}
          size="small"
          color="success"
          sx={{ fontWeight: 600 }}
        />
      )}

      {/* Always show last active if available */}
      {lastSeenText && (
        <Tooltip title={`Last active ${lastSeenText}`}>
          <Chip
            icon={<AccessTimeRoundedIcon />}
            label={compact ? undefined : `Active ${lastSeenText}`}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}
    </Box>
  )
}
