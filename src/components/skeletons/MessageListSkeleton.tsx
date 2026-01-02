import {
  ListItemButton,
  AvatarGroup,
  Avatar,
  Box,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import BusinessIcon from "@mui/icons-material/BusinessRounded"

export interface MessageListSkeletonProps {
  index?: number
}

/**
 * Skeleton component for chat list entries
 * Matches the layout of ChatEntry in MessagingSidebarContent
 */
export function MessageListSkeleton({ index = 0 }: MessageListSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <ListItemButton
      sx={{
        width: "100%",
        borderBottom: 1,
        borderColor: theme.palette.outline.main,
        padding: { xs: 2, sm: 3 },
        minHeight: { xs: 72, sm: 80 },
      }}
      disabled
    >
      <Box
        sx={{
          display: "flex",
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
        }}
        alignItems="center"
      >
        <AvatarGroup max={3} spacing="small">
          <Avatar>
            <BaseSkeleton variant="circular" width="100%" height="100%" />
          </Avatar>
          <Avatar>
            <BaseSkeleton variant="circular" width="100%" height="100%" />
          </Avatar>
        </AvatarGroup>

        <Box
          sx={{ marginLeft: 1, overflow: "hidden", flexGrow: 1, minWidth: 0 }}
        >
          <BaseSkeleton
            variant="text"
            width="80%"
            height={20}
            sx={{ mb: 0.5 }}
          />
          <BaseSkeleton variant="text" width="60%" height={16} />
        </Box>
      </Box>
    </ListItemButton>
  )
}
