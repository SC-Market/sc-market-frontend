import { Box, Avatar, Stack, TextField, IconButton } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"
import SendIcon from "@mui/icons-material/SendRounded"

export interface MessageThreadSkeletonProps {
  messageCount?: number
}

/**
 * Skeleton component for message thread
 * Matches the layout of MessagesBody/MessagesBodyMobile (header + messages + input)
 */
export function MessageThreadSkeleton({
  messageCount = 5,
}: MessageThreadSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Mobile toolbar spacer */}
      {isMobile && (
        <Box
          sx={{
            ...theme.mixins.toolbar,
            minHeight: 64,
            height: 64,
            flexShrink: 0,
          }}
        />
      )}

      {/* Header skeleton */}
      <Box
        sx={{
          width: "100%",
          padding: 1.5,
          boxSizing: "border-box",
          borderWidth: 0,
          borderBottom: `solid 1px ${theme.palette.outline.main}`,
          bgcolor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          minHeight: 56,
          height: 56,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          {isMobile && (
            <BaseSkeleton
              variant="circular"
              width={32}
              height={32}
              sx={{ flexShrink: 0 }}
            />
          )}
          <BaseSkeleton
            variant="circular"
            width={40}
            height={40}
            sx={{ flexShrink: 0 }}
          />
          <BaseSkeleton variant="text" width={120} height={24} />
        </Stack>
      </Box>

      {/* Messages area skeleton */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            padding: { xs: 1.5, sm: 2 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
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
                <BaseSkeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                />
              </Avatar>
              <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
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
      </Box>

      {/* Input area skeleton */}
      <Box
        sx={{
          width: "100%",
          padding: 1.5,
          borderTopColor: theme.palette.outline.main,
          boxSizing: "border-box",
          borderWidth: 0,
          borderTop: `solid 1px ${theme.palette.outline.main}`,
          display: "flex",
          flexDirection: "row",
          gap: 1,
          bgcolor: theme.palette.background.paper,
          alignItems: "flex-end",
          paddingBottom: 2,
          flexShrink: 0,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={3}
          variant="outlined"
          size="small"
          disabled
          placeholder="Loading..."
          sx={{
            "& .MuiInputBase-root": {
              bgcolor: theme.palette.action.disabledBackground,
            },
          }}
        />
        <IconButton
          disabled
          sx={{
            flexShrink: 0,
            alignSelf: "flex-end",
            marginBottom: 0.5,
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
