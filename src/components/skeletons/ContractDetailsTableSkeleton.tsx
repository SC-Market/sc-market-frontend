import {
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack,
  Avatar,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

/**
 * Skeleton component for contract details table
 * Matches the layout of ContractDetailsArea table
 */
export function ContractDetailsTableSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <TableContainer component={Paper}>
      <Table>
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
              <BaseSkeleton variant="text" width={120} height={20} />
            </TableCell>
          </TableRow>

          {/* Description row */}
          <TableRow
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell colSpan={2}>
              <Stack direction="column" spacing={theme.layoutSpacing.compact}>
                <BaseSkeleton variant="text" width={100} height={20} />
                <Stack spacing={1}>
                  <BaseSkeleton variant="text" width="100%" height={20} />
                  <BaseSkeleton variant="text" width="95%" height={20} />
                  <BaseSkeleton variant="text" width="90%" height={20} />
                </Stack>
              </Stack>
            </TableCell>
          </TableRow>

          {/* Offer row */}
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
        </TableBody>
      </Table>
    </TableContainer>
  )
}
