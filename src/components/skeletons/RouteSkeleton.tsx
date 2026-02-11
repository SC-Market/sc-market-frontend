import { BaseSkeleton } from "./BaseSkeleton"
import { CardSkeleton } from "./CardSkeleton"
import { TableSkeleton } from "./TableSkeleton"
import { ListingSkeleton } from "./ListingSkeleton"

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
import Container from '@mui/material/Container';
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

/**
 * Generic page skeleton with header and content area
 */
export function PageSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="40%" height={40} />
        <BaseSkeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
      </Box>
      <BaseSkeleton variant="rectangular" width="100%" height={400} />
    </Container>
  )
}

/**
 * Market page skeleton with filters and listings
 */
export function MarketPageSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Filters sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <BaseSkeleton variant="rectangular" width="100%" height={200} />
            <BaseSkeleton variant="rectangular" width="100%" height={150} />
            <BaseSkeleton variant="rectangular" width="100%" height={150} />
          </Box>
        </Grid>

        {/* Listings grid */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 2 }}>
            <BaseSkeleton variant="text" width="30%" height={32} />
          </Box>
          <Grid container spacing={2}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ListingSkeleton />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

/**
 * Dashboard skeleton with cards and stats
 */
export function DashboardSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="40%" height={40} />
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <CardSkeleton height={120} />
          </Grid>
        ))}
      </Grid>

      {/* Main content area */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CardSkeleton height={400} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardSkeleton height={400} />
        </Grid>
      </Grid>
    </Container>
  )
}

/**
 * Profile page skeleton
 */
export function ProfileSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header with avatar and info */}
      <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
        <BaseSkeleton variant="circular" width={120} height={120} />
        <Box sx={{ flex: 1 }}>
          <BaseSkeleton variant="text" width="40%" height={32} />
          <BaseSkeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
          <BaseSkeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <BaseSkeleton variant="rectangular" width="100%" height={48} />
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        {[...Array(3)].map((_, index) => (
          <Grid item xs={12} md={4} key={index}>
            <CardSkeleton height={200} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

/**
 * List page skeleton with table
 */
export function ListPageSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <BaseSkeleton variant="text" width="30%" height={40} />
        <BaseSkeleton variant="rectangular" width={120} height={40} />
      </Box>
      <TableSkeleton rows={10} columns={5} />
    </Container>
  )
}

/**
 * Detail page skeleton
 */
export function DetailPageSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        <BaseSkeleton variant="text" width="40%" height={24} />
      </Box>

      {/* Title */}
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="60%" height={40} />
        <BaseSkeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
      </Box>

      {/* Main content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CardSkeleton height={500} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CardSkeleton height={200} />
            <CardSkeleton height={150} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

/**
 * Form page skeleton
 */
export function FormPageSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width="50%" height={40} />
        <BaseSkeleton variant="text" width="70%" height={24} sx={{ mt: 1 }} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[...Array(5)].map((_, index) => (
          <Box key={index}>
            <BaseSkeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
            <BaseSkeleton variant="rectangular" width="100%" height={56} />
          </Box>
        ))}

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
          <BaseSkeleton variant="rectangular" width={100} height={40} />
          <BaseSkeleton variant="rectangular" width={100} height={40} />
        </Box>
      </Box>
    </Container>
  )
}

/**
 * Admin page skeleton with sidebar
 */
export function AdminPageSkeleton() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, p: 2, borderRight: 1, borderColor: "divider" }}>
        <BaseSkeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
        {[...Array(6)].map((_, index) => (
          <BaseSkeleton
            key={index}
            variant="rectangular"
            width="100%"
            height={40}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <BaseSkeleton variant="text" width="40%" height={40} />
        </Box>
        <TableSkeleton rows={15} columns={6} />
      </Box>
    </Box>
  )
}
