import React, { useState } from "react"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ServiceSidebarContext } from "../../../hooks/contract/ServiceSidebar"
import { ServiceSidebar } from "../../../views/contracts/ServiceSidebar"
import { ServiceSearchArea } from "../../../views/services/ServiceSearchArea"
import { ServiceListings } from "../../../views/contracts/ServiceListings"
import { useBottomNavHeight } from "../../../hooks/layout/useBottomNavHeight"

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

export function ProfileServicesView(props: { user: string }) {
  const { user } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const bottomNavHeight = useBottomNavHeight()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ServiceSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <ServiceSidebar />}
      {xs && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FilterListIcon />}
          aria-label={t("service_market.filters", "Filters")}
          onClick={() => setSidebarOpen((prev) => !prev)}
          sx={{
            position: "fixed",
            bottom: bottomNavHeight + 16,
            right: 24,
            zIndex: theme.zIndex.speedDial,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: theme.shadows[4],
            backgroundColor: theme.palette.background.paper,
            display: { xs: "inline-flex", md: "none" },
          }}
        >
          {t("service_market.filters", "Filters")}
        </Button>
      )}
      <Container maxWidth={"xl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid
            item
            xs={0}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Paper sx={{ padding: 1 }}>
              <ServiceSearchArea />
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent={"center"}
            >
              <ServiceListings user={user} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </ServiceSidebarContext.Provider>
  )
}

export function OrgServicesView(props: { org: string }) {
  const { org } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const bottomNavHeight = useBottomNavHeight()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ServiceSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <ServiceSidebar />}
      {xs && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FilterListIcon />}
          aria-label={t("service_market.filters", "Filters")}
          onClick={() => setSidebarOpen((prev) => !prev)}
          sx={{
            position: "fixed",
            bottom: bottomNavHeight + 16,
            right: 24,
            zIndex: theme.zIndex.speedDial,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: theme.shadows[4],
            backgroundColor: theme.palette.background.paper,
            display: { xs: "inline-flex", md: "none" },
          }}
        >
          {t("service_market.filters", "Filters")}
        </Button>
      )}
      <Container maxWidth={"xl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid
            item
            xs={0}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Paper sx={{ padding: 1 }}>
              <ServiceSearchArea />
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent={"center"}
            >
              <ServiceListings contractor={org} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </ServiceSidebarContext.Provider>
  )
}
