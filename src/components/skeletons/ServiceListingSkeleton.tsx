import {
  Grid,
  Fade,
  Card,
  CardActionArea,
  CardHeader,
  CardContent,
  Box,
  Stack,
  Avatar,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

export interface ServiceListingSkeletonProps {
  index?: number
}

/**
 * Skeleton component for service listing cards
 * Matches the exact structure of actual service cards
 */
export function ServiceListingSkeleton({
  index = 0,
}: ServiceListingSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={6}>
      <Fade
        in={true}
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <CardActionArea
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          <Card
            sx={{
              borderRadius: theme.spacing(theme.borderRadius.topLevel),
            }}
          >
            <CardHeader
              disableTypography
              sx={{
                overflow: "hidden",
                paddingBottom: 1,
                "& .MuiCardHeader-content": {
                  overflow: "hidden",
                },
              }}
              title={
                <Box display="flex" alignItems="center">
                  {/* Optional "NEW" chip */}
                  <BaseSkeleton
                    variant="rectangular"
                    width={50}
                    height={24}
                    sx={{
                      marginRight: 1,
                      borderRadius: 1,
                    }}
                  />
                  {/* Service name */}
                  <BaseSkeleton variant="text" width={200} height={28} />
                </Box>
              }
              subheader={
                <Box>
                  {/* ListingNameAndRating - user/contractor name and rating */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <BaseSkeleton variant="text" width={100} height={20} />
                    <BaseSkeleton variant="circular" width={16} height={16} />
                    <BaseSkeleton variant="text" width={40} height={18} />
                  </Stack>
                  {/* Price with payment type */}
                  <BaseSkeleton variant="text" width={150} height={20} />
                </Box>
              }
            />
            <CardContent sx={{ padding: 2, paddingTop: 0 }}>
              <Stack
                spacing={theme.layoutSpacing.text}
                direction="row"
                justifyContent="space-between"
              >
                {/* Description text (6 lines) */}
                <Box sx={{ flex: 1 }}>
                  <BaseSkeleton variant="text" width="100%" height={18} />
                  <BaseSkeleton variant="text" width="95%" height={18} />
                  <BaseSkeleton variant="text" width="90%" height={18} />
                  <BaseSkeleton variant="text" width="85%" height={18} />
                  <BaseSkeleton variant="text" width="92%" height={18} />
                  <BaseSkeleton variant="text" width="88%" height={18} />
                </Box>
                {/* Service photo (Avatar) */}
                <Avatar
                  variant="rounded"
                  sx={{
                    height: 128 + 32,
                    width: 128 + 32,
                    bgcolor: "action.disabledBackground",
                  }}
                >
                  <BaseSkeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    sx={{ borderRadius: 1 }}
                  />
                </Avatar>
              </Stack>
            </CardContent>
            {/* Bottom chips section */}
            <Box sx={{ padding: 2, paddingTop: 0 }}>
              <Stack
                direction="row"
                spacing={theme.layoutSpacing.compact}
                flexWrap="wrap"
              >
                {/* Service kind chip (primary, outlined) */}
                <BaseSkeleton
                  variant="rectangular"
                  width={120}
                  height={36}
                  sx={{ borderRadius: 1, marginBottom: 1 }}
                />
                {/* Optional rush chip (warning) */}
                <BaseSkeleton
                  variant="rectangular"
                  width={80}
                  height={36}
                  sx={{ borderRadius: 1, marginBottom: 1 }}
                />
                {/* Optional language chips */}
                <BaseSkeleton
                  variant="rectangular"
                  width={70}
                  height={36}
                  sx={{ borderRadius: 1, marginBottom: 1 }}
                />
                <BaseSkeleton
                  variant="rectangular"
                  width={60}
                  height={36}
                  sx={{ borderRadius: 1, marginBottom: 1 }}
                />
              </Stack>
            </Box>
          </Card>
        </CardActionArea>
      </Fade>
    </Grid>
  )
}
