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

export interface HorizontalListingSkeletonProps {
  index?: number
}

/**
 * Skeleton component for horizontal scrolling market listing cards
 * Matches the detailed layout of actual listing cards but in horizontal layout
 */
export function HorizontalListingSkeleton({
  index = 0,
}: HorizontalListingSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Box
      sx={{
        marginLeft: 1,
        marginRight: 1,
        width: isMobile ? 200 : 250,
        display: "inline-block",
        flexShrink: 0,
      }}
    >
      <Fade
        in={true}
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          <CardActionArea
            sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
          >
            <Card
              sx={{
                height: isMobile ? 300 : 420,
                position: "relative",
              }}
            >
              {/* Optional "NEW" chip skeleton (top left) */}
              <BaseSkeleton
                variant="rectangular"
                width={50}
                height={24}
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 5,
                  borderRadius: 1,
                }}
              />

              {/* Optional "INTERNAL" chip skeleton (top right) */}
              <BaseSkeleton
                variant="rectangular"
                width={80}
                height={20}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 5,
                  borderRadius: 1,
                }}
              />

              {/* CardMedia - Image area */}
              <CardMedia
                sx={{
                  height:
                    theme.palette.mode === "dark"
                      ? "100%"
                      : isMobile
                        ? 150
                        : 244,
                  overflow: "hidden",
                }}
              >
                <BaseSkeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                  sx={{
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  }}
                />
              </CardMedia>

              {/* Dark mode gradient overlay */}
              {theme.palette.mode === "dark" && (
                <Box
                  sx={{
                    position: "absolute",
                    zIndex: 3,
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                    background: `linear-gradient(to bottom, transparent, transparent 60%, ${theme.palette.background.sidebar}AA 70%, ${theme.palette.background.sidebar} 100%)`,
                  }}
                />
              )}

              {/* CardContent - Bottom section */}
              <CardContent
                sx={{
                  ...(theme.palette.mode === "dark"
                    ? {
                        position: "absolute",
                        bottom: 0,
                        zIndex: 4,
                      }
                    : {}),
                  maxWidth: "100%",
                  padding: isMobile ? "8px 12px !important" : undefined,
                }}
              >
                {/* Price (h5, primary, bold) */}
                <BaseSkeleton
                  variant="text"
                  width={isMobile ? 100 : 120}
                  height={isMobile ? 24 : 32}
                  sx={{ mb: 0.5 }}
                />

                {/* Title with item_type (subtitle2, 2 lines max) */}
                <BaseSkeleton
                  variant="text"
                  width="95%"
                  height={isMobile ? 36 : 60}
                  sx={{
                    mb: isMobile ? 0.5 : 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                />

                {/* Seller name and rating (on separate lines) */}
                <Box sx={{ mb: isMobile ? 0.25 : 0.5 }}>
                  <BaseSkeleton
                    variant="text"
                    width={isMobile ? 60 : 80}
                    height={isMobile ? 14 : 18}
                    sx={{ mb: isMobile ? 0.25 : 0.5, display: "block" }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? 0.5 : theme.layoutSpacing.text,
                    }}
                  >
                    <BaseSkeleton
                      variant="circular"
                      width={isMobile ? 12 : 16}
                      height={isMobile ? 12 : 16}
                    />
                    <BaseSkeleton
                      variant="text"
                      width={isMobile ? 30 : 40}
                      height={isMobile ? 14 : 18}
                    />
                  </Box>
                </Box>

                {/* Optional auction/expiration time */}
                {!isMobile && (
                  <BaseSkeleton
                    variant="text"
                    width={100}
                    height={18}
                    sx={{ mb: 0.5 }}
                  />
                )}

                {/* Available quantity */}
                <BaseSkeleton
                  variant="text"
                  width={isMobile ? 70 : 90}
                  height={isMobile ? 14 : 18}
                  sx={{ mb: isMobile ? 0 : 1 }}
                />

                {/* Optional language chips (hidden on mobile for space) */}
                {!isMobile && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      flexWrap: "wrap",
                      mt: 1,
                    }}
                  >
                    <BaseSkeleton
                      variant="rectangular"
                      width={60}
                      height={20}
                      sx={{ borderRadius: 1 }}
                    />
                    <BaseSkeleton
                      variant="rectangular"
                      width={50}
                      height={20}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </CardActionArea>
        </Box>
      </Fade>
    </Box>
  )
}
