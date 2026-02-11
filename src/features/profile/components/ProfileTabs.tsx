import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HapticTab } from "../../../components/haptic"
import { a11yProps } from "../../../components/tabs/Tabs"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
import { useTheme } from '@mui/material/styles';
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

interface ProfileTabsProps {
  username: string
  currentTab: number
}

export function ProfileTabs({ username, currentTab }: ProfileTabsProps) {
  const { t } = useTranslation()

  return (
    <>
      <Tabs
        value={currentTab}
        aria-label={t("ui.aria.orgInfoArea")}
        variant="scrollable"
        textColor="secondary"
        indicatorColor="secondary"
      >
        <HapticTab
          component={Link}
          to={`/user/${username}`}
          label={t("viewProfile.store_tab")}
          icon={<StorefrontRounded />}
          {...a11yProps(0)}
        />
        <HapticTab
          label={t("viewProfile.services_tab")}
          component={Link}
          to={`/user/${username}/services`}
          icon={<DesignServicesRounded />}
          {...a11yProps(1)}
        />
        <HapticTab
          label={t("viewProfile.about_tab")}
          component={Link}
          to={`/user/${username}/about`}
          icon={<InfoRounded />}
          {...a11yProps(2)}
        />
        <HapticTab
          label={t("viewProfile.order_tab")}
          component={Link}
          to={`/user/${username}/order`}
          icon={<CreateRounded />}
          {...a11yProps(3)}
        />
        <HapticTab
          label={t("viewProfile.reviews_tab")}
          component={Link}
          to={`/user/${username}/reviews`}
          icon={<StarRounded />}
          {...a11yProps(4)}
        />
      </Tabs>
      <Divider light />
    </>
  )
}
