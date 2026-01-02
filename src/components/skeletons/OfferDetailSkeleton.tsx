import {
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack,
  Avatar,
  Box,
  Skeleton,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

export interface OfferDetailSkeletonProps {
  showContract?: boolean
  showAssigned?: boolean
  showContractLink?: boolean
}

/**
 * Skeleton component for offer detail table
 * Matches the layout of OfferDetailsArea table
 */
export function OfferDetailSkeleton({
  showContract = false,
  showAssigned = false,
  showContractLink = false,
}: OfferDetailSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        overflowX: "auto",
        overflowY: "visible",
      }}
    >
      <Table sx={{ tableLayout: "auto" }}>
        <TableBody>
          {/* Customer row */}
          <TableRow
            sx={{
              "&:last-child td, &:last-child th": { border: 0 },
            }}
          >
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={100} height={20} />
            </TableCell>
            <TableCell align="right">
              <Stack direction="row" justifyContent="right">
                <Stack direction="column" spacing={0.5}>
                  <Stack
                    direction="row"
                    spacing={theme.layoutSpacing.compact}
                    alignItems="center"
                  >
                    <Avatar>
                      <BaseSkeleton variant="circular" width="100%" height="100%" />
                    </Avatar>
                    <Stack direction="column" justifyContent="left">
                      <BaseSkeleton variant="text" width={100} height={20} />
                      <BaseSkeleton variant="text" width={80} height={16} />
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <BaseSkeleton variant="circular" width={16} height={16} />
                    <BaseSkeleton variant="text" width={60} height={16} />
                  </Stack>
                </Stack>
              </Stack>
            </TableCell>
          </TableRow>

          {/* Associated contract row (conditional) */}
          {showContractLink && (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <BaseSkeleton variant="text" width={150} height={20} />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent="right">
                  <BaseSkeleton variant="text" width={200} height={20} />
                </Stack>
              </TableCell>
            </TableRow>
          )}

          {/* Seller row */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <Stack direction="row" justifyContent="right">
                <Stack direction="column" spacing={0.5}>
                  {showAssigned && (
                    <Stack
                      direction="row"
                      spacing={theme.layoutSpacing.compact}
                      alignItems="center"
                    >
                      <Avatar>
                        <BaseSkeleton variant="circular" width="100%" height="100%" />
                      </Avatar>
                      <Stack direction="column" justifyContent="left">
                        <BaseSkeleton variant="text" width={100} height={20} />
                        <BaseSkeleton variant="text" width={80} height={16} />
                      </Stack>
                    </Stack>
                  )}
                  {showContract && (
                    <Stack
                      direction="row"
                      spacing={theme.layoutSpacing.compact}
                      alignItems="center"
                    >
                      <Avatar>
                        <BaseSkeleton variant="circular" width="100%" height="100%" />
                      </Avatar>
                      <Stack direction="column" justifyContent="left">
                        <BaseSkeleton variant="text" width={100} height={20} />
                        <BaseSkeleton variant="text" width={80} height={16} />
                      </Stack>
                    </Stack>
                  )}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <BaseSkeleton variant="circular" width={16} height={16} />
                    <BaseSkeleton variant="text" width={60} height={16} />
                  </Stack>
                </Stack>
              </Stack>
            </TableCell>
          </TableRow>

          {/* Date row */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width={200} height={20} />
            </TableCell>
          </TableRow>

          {/* Status row */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton
                variant="rectangular"
                width={120}
                height={32}
                sx={{ borderRadius: 1 }}
              />
            </TableCell>
          </TableRow>

          {/* Title row */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width="80%" height={20} />
            </TableCell>
          </TableRow>

          {/* Kind row */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width={100} height={20} />
            </TableCell>
          </TableRow>

          {/* Description row */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell colSpan={2}>
              <Stack direction="column" spacing={theme.layoutSpacing.compact}>
                <BaseSkeleton variant="text" width={100} height={20} />
                <BaseSkeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                <BaseSkeleton variant="text" width="95%" height={20} sx={{ mb: 0.5 }} />
                <BaseSkeleton variant="text" width="90%" height={20} />
              </Stack>
            </TableCell>
          </TableRow>

          {/* Offer cost row */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width={150} height={20} />
            </TableCell>
          </TableRow>

          {/* Discord thread row (optional) */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={120} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width={100} height={20} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
