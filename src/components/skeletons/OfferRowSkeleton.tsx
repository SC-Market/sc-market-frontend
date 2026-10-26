import {
  Box,
  TableRow,
  TableCell,
  Stack,
  Paper,
  Typography,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"

export interface OfferRowSkeletonProps {
  index?: number
}

/**
 * Skeleton component for offer table rows
 * Matches the layout of actual offer rows in ReceivedOffersArea
 */
export function OfferRowSkeleton({ index = 0 }: OfferRowSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useBreakpointDown("sm")

  // Same cell padding rule as OfferRow (the checkbox cell included), and the
  // same line boxes as its text, so the placeholder rows have the loaded
  // rows' height (97px from sm) and column widths.
  return (
    <TableRow
      sx={{
        "& .MuiTableCell-root": {
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        },
      }}
    >
      {/* Checkbox column: a 42px checkbox, hidden on phones like OfferRow's */}
      <TableCell
        padding="checkbox"
        sx={{ display: { xs: "none", sm: "table-cell" } }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BaseSkeleton variant="rectangular" width={18} height={18} />
        </Box>
      </TableCell>
      {/* Offer column: date tile, then title / summary / shop lines */}
      <TableCell
        sx={{
          width: { xs: "45%", sm: "auto" },
          minWidth: { xs: 0, sm: "auto" },
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
            <Stack direction="column" alignItems="center">
              <Typography
                variant="subtitle2"
                sx={{ fontSize: { xs: "0.625rem", sm: "0.875rem" } }}
              >
                <BaseSkeleton variant="text" width={24} />
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontSize: { xs: "1rem", sm: "1.5rem" } }}
              >
                <BaseSkeleton variant="text" width={28} />
              </Typography>
            </Stack>
          </Paper>
          <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              <BaseSkeleton variant="text" width={isMobile ? 110 : 150} />
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              <BaseSkeleton variant="text" width={isMobile ? 120 : 200} />
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              <BaseSkeleton variant="text" width={isMobile ? 70 : 110} />
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* Customer column: UserAvatar (40px avatar, name and rating lines) */}
      <TableCell
        align="right"
        sx={{
          textAlign: { xs: "left", sm: "right" },
          width: { xs: "30%", sm: "auto" },
          minWidth: { xs: 80, sm: "auto" },
        }}
      >
        <Stack
          spacing={theme.layoutSpacing.compact}
          direction="row"
          justifyContent="right"
          alignItems="center"
        >
          <BaseSkeleton
            variant="circular"
            sx={{
              width: { xs: 28, sm: 40 },
              height: { xs: 28, sm: 40 },
              flexShrink: 0,
            }}
          />
          <Stack direction="column" justifyContent="center">
            <BaseSkeleton variant="text" width={isMobile ? 50 : 100} height={17} />
            <BaseSkeleton variant="text" width={isMobile ? 50 : 100} height={22} />
          </Stack>
        </Stack>
      </TableCell>

      {/* Status column: the status chip (32px from sm, 24px on phones) */}
      <TableCell
        align="right"
        sx={{
          width: { xs: "25%", sm: "auto" },
          minWidth: { xs: 70, sm: "auto" },
        }}
      >
        <Stack alignItems="flex-end">
          <BaseSkeleton
            variant="rounded"
            width={isMobile ? 70 : 180}
            height={isMobile ? 24 : 32}
            sx={{ borderRadius: 4 }}
          />
        </Stack>
      </TableCell>
    </TableRow>
  )
}
