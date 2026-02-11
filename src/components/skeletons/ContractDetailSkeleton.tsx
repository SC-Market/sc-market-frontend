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

export interface ContractDetailSkeletonProps {
  showActions?: boolean
}

/**
 * Skeleton component for contract detail card
 * Matches the layout of ViewContract component
 */
export function ContractDetailSkeleton({
  showActions = true,
}: ContractDetailSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Card
      sx={{
        padding: 3,
      }}
    >
      <CardHeader
        disableTypography
        title={<BaseSkeleton variant="text" width={300} height={28} />}
        subheader={
          <Box
            sx={{ padding: 1.5, paddingLeft: 0 }}
            display="flex"
            alignItems="center"
          >
            {/* Optional "NEW" chip */}
            <BaseSkeleton
              variant="rectangular"
              width={50}
              height={24}
              sx={{ marginRight: 1, borderRadius: 1 }}
            />
            {/* Customer name and time */}
            <BaseSkeleton variant="text" width={120} height={20} />
            <BaseSkeleton
              variant="text"
              width={100}
              height={20}
              sx={{ ml: 1 }}
            />
          </Box>
        }
      />
      <CardContent sx={{ width: "auto", minHeight: 120, paddingTop: 0 }}>
        <Stack spacing={1}>
          <BaseSkeleton variant="text" width="100%" height={20} />
          <BaseSkeleton variant="text" width="95%" height={20} />
          <BaseSkeleton variant="text" width="90%" height={20} />
          <BaseSkeleton variant="text" width="85%" height={20} />
        </Stack>
      </CardContent>
      {showActions && (
        <CardActions>
          <Stack direction="row" spacing={1}>
            <BaseSkeleton
              variant="rectangular"
              width={120}
              height={36}
              sx={{ borderRadius: 1 }}
            />
            <BaseSkeleton
              variant="rectangular"
              width={100}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </CardActions>
      )}
    </Card>
  )
}
