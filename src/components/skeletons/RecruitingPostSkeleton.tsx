import React from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"

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
import TableHead from '@mui/material/TableHead';
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

export interface RecruitingPostSkeletonProps {
  /**
   * Whether to show the vote button skeleton in the top right
   */
  showVoteButton?: boolean
}

export function RecruitingPostSkeleton(
  props: RecruitingPostSkeletonProps = {},
) {
  const { showVoteButton = true } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={12}>
      <Box
        sx={{
          position: "relative",
        }}
      >
        {showVoteButton && (
          <Box
            sx={{
              position: "absolute",
              top: theme.spacing(2),
              right: theme.spacing(2),
              zIndex: 2,
            }}
          >
            <Skeleton
              variant="rectangular"
              width={60}
              height={40}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        )}
        <CardActionArea
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          <Card
            sx={{
              borderRadius: theme.spacing(theme.borderRadius.topLevel),
              padding: 1,
              border: `1px solid ${theme.palette.outline.main}`,
            }}
          >
            <CardHeader
              avatar={
                <Skeleton
                  variant="rectangular"
                  sx={{
                    maxHeight: theme.spacing(12),
                    maxWidth: theme.spacing(12),
                    width: "100%",
                    height: "100%",
                    borderRadius: theme.spacing(theme.borderRadius.image),
                  }}
                />
              }
              title={
                <Skeleton
                  variant="text"
                  width={200}
                  height={24}
                  sx={{ mb: 0.5 }}
                />
              }
              subheader={
                <Box>
                  <Grid
                    container
                    alignItems={"center"}
                    spacing={theme.layoutSpacing.compact}
                  >
                    <Grid item>
                      <PeopleAltRoundedIcon
                        style={{ color: theme.palette.text.primary }}
                      />
                    </Grid>
                    <Grid item>
                      <Skeleton
                        variant="text"
                        width={40}
                        height={20}
                        sx={{ marginLeft: 1 }}
                      />
                    </Grid>
                  </Grid>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ mt: 0.5 }}
                  >
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton variant="text" width={60} height={16} />
                  </Stack>
                </Box>
              }
            />
            <CardContent>
              <Skeleton
                variant="text"
                width="80%"
                height={32}
                sx={{ mx: "auto", mb: 2 }}
              />
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="90%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="85%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton variant="text" width="75%" height={20} />
            </CardContent>
            <CardActions>
              <Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={32}
                    sx={{
                      borderRadius: 1,
                      marginBottom: 1,
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={32}
                    sx={{
                      borderRadius: 1,
                      marginBottom: 1,
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={32}
                    sx={{
                      borderRadius: 1,
                      marginBottom: 1,
                    }}
                  />
                </Stack>
              </Box>
            </CardActions>
          </Card>
        </CardActionArea>
      </Box>
    </Grid>
  )
}
