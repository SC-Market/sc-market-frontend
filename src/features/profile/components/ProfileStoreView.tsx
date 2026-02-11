import React, { useState } from "react"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ItemListings } from "../../../views/market/ItemListings"
import {
  MarketSidebarContext,
  MarketSidebar,
  MarketSideBarToggleButton,
  MarketSearchArea,
} from "../../market"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import useTheme1 from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';

export function ProfileStoreView(props: { user: string }) {
  const { user } = props
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MarketSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <MarketSidebar />}
      {xs && <MarketSideBarToggleButton />}
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        justifyContent={"center"}
      >
        <Grid item xs={0} md={3} sx={{ display: { xs: "none", md: "block" } }}>
          <Paper sx={{ padding: 1 }}>
            <MarketSearchArea />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid
            container
            spacing={theme.layoutSpacing.layout}
            justifyContent={"center"}
          >
            <ItemListings user={user} />
          </Grid>
        </Grid>
      </Grid>
    </MarketSidebarContext.Provider>
  )
}

export function OrgStoreView(props: { org: string }) {
  const { org } = props
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MarketSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <MarketSidebar />}
      {xs && <MarketSideBarToggleButton />}
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        justifyContent={"center"}
      >
        <Grid item xs={0} md={3} sx={{ display: { xs: "none", md: "block" } }}>
          <Paper sx={{ padding: 1 }}>
            <MarketSearchArea />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid
            container
            spacing={theme.layoutSpacing.layout}
            justifyContent={"center"}
          >
            <ItemListings org={org} />
          </Grid>
        </Grid>
      </Grid>
    </MarketSidebarContext.Provider>
  )
}
