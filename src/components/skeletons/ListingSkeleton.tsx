import {
  Fade,
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

export interface ListingSkeletonProps {
  index?: number
  sidebarOpen?: boolean
}

import { ListingWrapper } from "../../features/market/components/listings/ListingCard"

/**
 * Skeleton component for market listing cards
 * Matches the detailed layout of actual listing cards
 * Returns a Box with fixed width (use in map functions)
 */
export function ListingSkeleton({
  index = 0,
  sidebarOpen = false,
}: ListingSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <ListingWrapper>
      <Fade
        in={true}
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          <CardActionArea
            sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
          >
            <Card
              sx={{
                height: 300,
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
                  height: theme.palette.mode === "dark" ? "100%" : 150,
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
                  padding: "8px 12px !important",
                }}
              >
                {/* Price (h5, primary, bold) */}
                <BaseSkeleton
                  variant="text"
                  width={100}
                  height={24}
                  sx={{ mb: 0.5 }}
                />

                {/* Title with item_type (subtitle2, 2 lines max) */}
                <BaseSkeleton
                  variant="text"
                  width="95%"
                  height={36}
                  sx={{
                    mb: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                />

                {/* Seller name and rating (on separate lines) */}
                <Box sx={{ mb: 0.25 }}>
                  <BaseSkeleton
                    variant="text"
                    width={60}
                    height={14}
                    sx={{ mb: 0.25, display: "block" }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <BaseSkeleton
                      variant="circular"
                      width={12}
                      height={12}
                    />
                    <BaseSkeleton
                      variant="text"
                      width={30}
                      height={14}
                    />
                  </Box>
                </Box>

                {/* Available quantity */}
                <BaseSkeleton
                  variant="text"
                  width={70}
                  height={14}
                  sx={{ mb: 0 }}
                />
              </CardContent>
            </Card>
          </CardActionArea>
        </Box>
      </Fade>
    </ListingWrapper>
  )
}
