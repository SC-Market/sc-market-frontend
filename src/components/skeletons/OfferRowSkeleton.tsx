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
import { SkeletonProps } from '@mui/material/SkeletonProps';
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
import ListItemButton from '@mui/material/ListItemButton';
import AvatarGroup from '@mui/material/AvatarGroup';
import Checkbox from '@mui/material/Checkbox';
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
