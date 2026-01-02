import {
  Grid,
  Fade,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Box,
  Stack,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

export interface ListingSkeletonProps {
  index?: number
  sidebarOpen?: boolean
}

/**
 * Skeleton component for market listing cards
 * Matches the detailed layout of actual listing cards
 * Returns a single Grid item (use in map functions)
 */
export function ListingSkeleton({
  index = 0,
  sidebarOpen = false,
}: ListingSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid
      item
      xs={sidebarOpen ? 12 : 6}
      md={sidebarOpen ? 12 : 4}
      lg={sidebarOpen ? 6 : 4}
      xl={3}
      sx={{ transition: "0.3s" }}
    >
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
                height: 400,
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
                  height: theme.palette.mode === "dark" ? "100%" : 244,
                  overflow: "hidden",
                }}
              >
                <BaseSkeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
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
                }}
              >
                {/* Price (h5, primary, bold) */}
                <BaseSkeleton
                  variant="text"
                  width={120}
                  height={32}
                  sx={{ mb: 0.5 }}
                />

                {/* Title with item_type (subtitle2, 2 lines max) */}
                <BaseSkeleton
                  variant="text"
                  width="95%"
                  height={60}
                  sx={{
                    mb: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                />

                {/* Seller name and rating (Stack with theme.layoutSpacing.text) */}
                <Stack
                  direction="row"
                  spacing={theme.layoutSpacing.text}
                  alignItems="center"
                  sx={{ mb: 0.5, width: "100%", overflowX: "hidden" }}
                >
                  <BaseSkeleton variant="text" width={80} height={18} />
                  <BaseSkeleton variant="circular" width={16} height={16} />
                  <BaseSkeleton variant="text" width={40} height={18} />
                </Stack>

                {/* Optional auction/expiration time */}
                <BaseSkeleton
                  variant="text"
                  width={100}
                  height={18}
                  sx={{ mb: 0.5 }}
                />

                {/* Available quantity */}
                <BaseSkeleton variant="text" width={90} height={18} sx={{ mb: 1 }} />

                {/* Optional language chips (height: 20, fontSize: 0.7rem) */}
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
              </CardContent>
            </Card>
          </CardActionArea>
        </Box>
      </Fade>
    </Grid>
  )
}
