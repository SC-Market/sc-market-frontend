import { Box, Avatar, Stack, Paper, Typography } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"

export interface MessageThreadSkeletonProps {
  messageCount?: number
}

/**
 * Skeleton component for message thread
 * Matches the layout of MessagesBody message area (MessageEntry2 structure)
 */
export function MessageThreadSkeleton({
  messageCount = 5,
}: MessageThreadSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: "auto",
        padding: { xs: 1.5, sm: 2 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        paddingBottom: { xs: 10, sm: 2 },
      }}
    >
      {Array.from({ length: messageCount }).map((_, index) => (
        <Stack
          key={index}
          direction="row"
          spacing={theme.layoutSpacing.compact}
          justifyContent="flex-start"
        >
          <Avatar
            variant="rounded"
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              flexShrink: 0,
            }}
          >
            <BaseSkeleton variant="rectangular" width="100%" height="100%" />
          </Avatar>
          <Stack direction="column">
            <Stack
              direction="row"
              spacing={theme.layoutSpacing.compact}
              alignItems="flex-end"
            >
              <BaseSkeleton variant="text" width={100} height={18} />
              <BaseSkeleton
                variant="text"
                width={80}
                height={14}
                sx={{ marginRight: 4 }}
              />
            </Stack>
            <BaseSkeleton
              variant="text"
              width={isMobile ? 200 : 300}
              height={20}
            />
            <BaseSkeleton
              variant="text"
              width={isMobile ? 180 : 280}
              height={20}
            />
          </Stack>
        </Stack>
      ))}
    </Box>
  )
}
