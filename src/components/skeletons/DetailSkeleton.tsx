import { BaseSkeleton } from "./BaseSkeleton"

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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/SkeletonProps';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
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

export interface DetailSkeletonProps {
  showImage?: boolean
  showActions?: boolean
  sections?: number
}

/**
 * Skeleton component for detail page loading states
 * Matches the layout of detail pages with image, title, description, etc.
 */
export function DetailSkeleton({
  showImage = true,
  showActions = true,
  sections = 2,
}: DetailSkeletonProps) {
  return (
    <Stack spacing={3}>
      {/* Image section */}
      {showImage && (
        <BaseSkeleton
          variant="rectangular"
          width="100%"
          height={400}
          sx={{ borderRadius: 2 }}
        />
      )}

      {/* Title and actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <BaseSkeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
          <BaseSkeleton variant="text" width="40%" height={24} />
        </Box>
        {showActions && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <BaseSkeleton variant="rectangular" width={100} height={36} />
            <BaseSkeleton variant="rectangular" width={100} height={36} />
          </Box>
        )}
      </Box>

      <Divider />

      {/* Description section */}
      <Stack spacing={1}>
        <BaseSkeleton variant="text" width="100%" height={20} />
        <BaseSkeleton variant="text" width="100%" height={20} />
        <BaseSkeleton variant="text" width="80%" height={20} />
      </Stack>

      {/* Additional sections */}
      {Array.from({ length: sections }).map((_, i) => (
        <Box key={i}>
          <Divider sx={{ my: 2 }} />
          <BaseSkeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <BaseSkeleton variant="text" width="100%" height={20} />
            <BaseSkeleton variant="text" width="90%" height={20} />
            <BaseSkeleton variant="text" width="95%" height={20} />
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
