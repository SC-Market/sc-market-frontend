import React from "react"
import { TabPanel } from "../../../components/tabs/Tabs"
import { Section } from "../../../components/paper/Section"
import { CreateOrderForm } from "../../../views/orders/CreateOrderForm"
import { UserReviews } from "../../../views/contractor/OrgReviews"
import { ProfileStoreView } from "./ProfileStoreView"
import { ProfileServicesView } from "./ProfileServicesView"
import { ProfileAboutTab } from "./ProfileAboutTab"
import { User } from "../../../datatypes/User"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

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

interface ProfileTabContentProps {
  currentTab: number
  profile: User
  isMyProfile: boolean
  submitUpdate: (data: {
    about?: string
    display_name?: string
  }) => Promise<boolean>
}

export function ProfileTabContent({
  currentTab,
  profile,
  isMyProfile,
  submitUpdate,
}: ProfileTabContentProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <TabPanel value={currentTab} index={0}>
        <ProfileStoreView user={profile.username} />
      </TabPanel>
      <TabPanel index={currentTab} value={1}>
        <ProfileServicesView user={profile.username} />
      </TabPanel>
      <TabPanel index={currentTab} value={2}>
        <ProfileAboutTab
          profile={profile}
          submitUpdate={submitUpdate}
          isMyProfile={isMyProfile}
        />
      </TabPanel>
      <TabPanel index={currentTab} value={3}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <CreateOrderForm assigned_to={profile.username} />
        </Grid>
      </TabPanel>
      <TabPanel index={currentTab} value={4}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Section xs={12} lg={8} disablePadding>
            <UserReviews user={profile} />
          </Section>
        </Grid>
      </TabPanel>
    </Container>
  )
}
