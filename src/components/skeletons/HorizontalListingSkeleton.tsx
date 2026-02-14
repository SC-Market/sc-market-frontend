import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Box,
  Stack,
  useMediaQuery,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

export interface HorizontalListingSkeletonProps {
  index?: number
}

/**
 * Skeleton component for horizontal scrolling market listing cards
 * Matches the detailed layout of actual listing cards but in horizontal layout
 */
export function HorizontalListingSkeleton({
  index = 0,
}: HorizontalListingSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Box
      sx={{
        marginLeft: 1,
        marginRight: 1,
        width: isMobile ? 200 : 250,
        display: "inline-block",
        flexShrink: 0,
      }}
    >
      <CardActionArea
        sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
      >
        <Card
          sx={{
            height: isMobile ? 300 : 420,
            position: "relative",
          }}
        >
              {/* Optional "NEW" chip skeleton (top left) */}
              <BaseSkeleton
                variant="rectangular"
                width={50}
                height={24}
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 5,
                  borderRadius: 1,
                }}
              />

              {/* Optional "INTERNAL" chip skeleton (top right) */}
              <BaseSkeleton
                variant="rectangular"
                width={80}
                height={20}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 5,
                  borderRadius: 1,
                }}
              />

              {/* CardMedia - Image area */}
              <CardMedia
                sx={{
                  height:
                    theme.palette.mode === "dark"
                      ? "100%"
                      : isMobile
                        ? 150
                        : 244,
                  overflow: "hidden",
                }}
              >
                <BaseSkeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                  sx={{
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  }}
                />
              </CardMedia>

              {/* Dark mode gradient overlay */}
              {theme.palette.mode === "dark" && (
                <Box
                  sx={{
                    position: "absolute",
                    zIndex: 3,
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                    background: `linear-gradient(to bottom, transparent, transparent 60%, ${theme.palette.background.sidebar}AA 70%, ${theme.palette.background.sidebar} 100%)`,
                  }}
                />
              )}

              {/* CardContent - Bottom section */}
              <CardContent
                sx={{
                  ...(theme.palette.mode === "dark"
                    ? {
                        position: "absolute",
                        bottom: 0,
                        zIndex: 4,
                      }
                    : {}),
                  maxWidth: "100%",
                  padding: isMobile ? "8px 12px !important" : undefined,
                }}
              >
                {/* Price (h5, primary, bold) */}
                <BaseSkeleton
                  variant="text"
                  width={isMobile ? 100 : 120}
                  height={isMobile ? 24 : 32}
                  sx={{ mb: 0.5 }}
                />

                {/* Title with item_type (subtitle2, 2 lines max) */}
                <BaseSkeleton
                  variant="text"
                  width="95%"
                  height={isMobile ? 36 : 60}
                  sx={{
                    mb: isMobile ? 0.5 : 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                />

                {/* Seller name and rating (on separate lines) */}
                <Box sx={{ mb: isMobile ? 0.25 : 0.5 }}>
                  <BaseSkeleton
                    variant="text"
                    width={isMobile ? 60 : 80}
                    height={isMobile ? 14 : 18}
                    sx={{ mb: isMobile ? 0.25 : 0.5, display: "block" }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? 0.5 : theme.layoutSpacing.text,
                    }}
                  >
                    <BaseSkeleton
                      variant="circular"
                      width={isMobile ? 12 : 16}
                      height={isMobile ? 12 : 16}
                    />
                    <BaseSkeleton
                      variant="text"
                      width={isMobile ? 30 : 40}
                      height={isMobile ? 14 : 18}
                    />
                  </Box>
                </Box>

                {/* Optional auction/expiration time */}
                {!isMobile && (
                  <BaseSkeleton
                    variant="text"
                    width={100}
                    height={18}
                    sx={{ mb: 0.5 }}
                  />
                )}

                {/* Available quantity */}
                <BaseSkeleton
                  variant="text"
                  width={isMobile ? 70 : 90}
                  height={isMobile ? 14 : 18}
                  sx={{ mb: isMobile ? 0 : 1 }}
                />

                {/* Optional language chips (hidden on mobile for space) */}
                {!isMobile && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      flexWrap: "wrap",
                      mt: 1,
                    }}
                  >
                    <BaseSkeleton
                      variant="rectangular"
                      width={60}
                      height={20}
                      sx={{ borderRadius: 1 }}
                    />
                    <BaseSkeleton
                      variant="rectangular"
                      width={50}
                      height={20}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </CardActionArea>
    </Box>
  )
}
