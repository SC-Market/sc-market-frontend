import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Fade from '@mui/material/Fade';
import CardMedia from '@mui/material/CardMedia';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import CableRounded from '@mui/icons-material/CableRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import RequestQuoteRounded from '@mui/icons-material/RequestQuoteRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';

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
                      <BaseSkeleton
                        variant="circular"
                        width="100%"
                        height="100%"
                      />
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
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
                        <BaseSkeleton
                          variant="circular"
                          width="100%"
                          height="100%"
                        />
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
                        <BaseSkeleton
                          variant="circular"
                          width="100%"
                          height="100%"
                        />
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
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width={200} height={20} />
            </TableCell>
          </TableRow>

          {/* Status row */}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width="80%" height={20} />
            </TableCell>
          </TableRow>

          {/* Kind row */}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width={100} height={20} />
            </TableCell>
          </TableRow>

          {/* Description row */}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell colSpan={2}>
              <Stack direction="column" spacing={theme.layoutSpacing.compact}>
                <BaseSkeleton variant="text" width={100} height={20} />
                <BaseSkeleton
                  variant="text"
                  width="100%"
                  height={20}
                  sx={{ mb: 0.5 }}
                />
                <BaseSkeleton
                  variant="text"
                  width="95%"
                  height={20}
                  sx={{ mb: 0.5 }}
                />
                <BaseSkeleton variant="text" width="90%" height={20} />
              </Stack>
            </TableCell>
          </TableRow>

          {/* Offer cost row */}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell component="th" scope="row">
              <BaseSkeleton variant="text" width={80} height={20} />
            </TableCell>
            <TableCell align="right">
              <BaseSkeleton variant="text" width={150} height={20} />
            </TableCell>
          </TableRow>

          {/* Discord thread row (optional) */}
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
