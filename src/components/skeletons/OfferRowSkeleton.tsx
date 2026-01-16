import {
  TableRow,
  TableCell,
  Avatar,
  Stack,
  Paper,
  Checkbox,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"

export interface OfferRowSkeletonProps {
  index?: number
}

/**
 * Skeleton component for offer table rows
 * Matches the layout of actual offer rows in ReceivedOffersArea
 */
export function OfferRowSkeleton({ index = 0 }: OfferRowSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <TableRow>
      {/* Checkbox column - matches OfferRow structure when selection is enabled */}
      <TableCell
        padding="checkbox"
        sx={{
          display: { xs: "none", sm: "table-cell" }, // Hide checkbox on mobile, matching OfferRow
        }}
      >
        <BaseSkeleton variant="rectangular" width={24} height={24} />
      </TableCell>
      {/* Offer column (timestamp) */}
      <TableCell
        sx={{
          width: { xs: "45%", sm: "auto" },
          minWidth: { xs: 0, sm: "auto" },
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        }}
      >
        <Stack
          spacing={theme.layoutSpacing.compact}
          direction="row"
          alignItems="center"
          justifyContent="left"
        >
          <Paper
            sx={{
              padding: { xs: 0.25, sm: 0.5 },
              bgcolor: theme.palette.background.default,
              minWidth: { xs: 40, sm: 50 },
              flexShrink: 0,
            }}
          >
            <Stack
              direction="column"
              alignItems="center"
              justifyContent="space-between"
            >
              <BaseSkeleton
                variant="text"
                width={30}
                height={isMobile ? 12 : 16}
                sx={{ mb: 0.5 }}
              />
              <BaseSkeleton
                variant="text"
                width={isMobile ? 20 : 30}
                height={isMobile ? 16 : 24}
              />
            </Stack>
          </Paper>
          <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
            <BaseSkeleton
              variant="text"
              width={isMobile ? 120 : 200}
              height={isMobile ? 16 : 20}
              sx={{ mb: 0.5 }}
            />
            <BaseSkeleton
              variant="text"
              width={isMobile ? 100 : 150}
              height={isMobile ? 14 : 16}
            />
          </Stack>
        </Stack>
      </TableCell>

      {/* Customer column - matches UserAvatar structure */}
      <TableCell
        align="right"
        sx={{
          display: { xs: "table-cell", md: "table-cell" },
          textAlign: { xs: "left", sm: "right" },
          width: { xs: "30%", sm: "auto" },
          minWidth: { xs: 80, sm: "auto" },
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        }}
      >
        <Stack
          spacing={theme.layoutSpacing.compact}
          direction="row"
          justifyContent="right"
          alignItems="center"
        >
          <Avatar
            sx={{
              width: { xs: 28, sm: 40 },
              height: { xs: 28, sm: 40 },
              flexShrink: 0,
            }}
          >
            <BaseSkeleton variant="circular" width="100%" height="100%" />
          </Avatar>
          <Stack direction="column" justifyContent="center" alignItems="center">
            <BaseSkeleton
              variant="text"
              width={isMobile ? 60 : 100}
              height={isMobile ? 16 : 20}
              sx={{ mb: 0.5 }}
            />
            <BaseSkeleton
              variant="text"
              width={isMobile ? 50 : 80}
              height={isMobile ? 14 : 16}
            />
          </Stack>
        </Stack>
      </TableCell>

      {/* Status column */}
      <TableCell
        align="right"
        sx={{
          width: { xs: "25%", sm: "auto" },
          minWidth: { xs: 70, sm: "auto" },
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        }}
      >
        <BaseSkeleton
          variant="rectangular"
          width={isMobile ? 60 : 80}
          height={isMobile ? 24 : 32}
          sx={{ borderRadius: 1, mx: "auto" }}
        />
      </TableCell>
    </TableRow>
  )
}
