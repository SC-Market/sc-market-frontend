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
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
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
