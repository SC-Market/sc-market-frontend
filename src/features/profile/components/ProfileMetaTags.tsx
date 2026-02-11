import React from "react"
import { Helmet } from "react-helmet"
import { User } from "../../../datatypes/User"
import { FRONTEND_URL } from "../../../util/constants"

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

interface ProfileMetaTagsProps {
  profile: User
}

export function ProfileMetaTags({ profile }: ProfileMetaTagsProps) {
  return (
    <Helmet>
      <meta property="og:type" content="profile" />
      <meta
        property="og:url"
        content={`${FRONTEND_URL}/people/${profile.username}`}
      />
      <meta
        property="og:title"
        content={`${profile.display_name} - SC Market`}
      />
      <meta
        property="og:description"
        content={
          profile.profile_description ||
          `${profile.display_name}'s profile on SC Market`
        }
      />
      <meta property="og:image" content={profile.banner || profile.avatar} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:url"
        content={`${FRONTEND_URL}/people/${profile.username}`}
      />
      <meta
        name="twitter:title"
        content={`${profile.display_name} - SC Market`}
      />
      <meta
        name="twitter:description"
        content={
          profile.profile_description ||
          `${profile.display_name}'s profile on SC Market`
        }
      />
      <meta name="twitter:image" content={profile.banner || profile.avatar} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Contractor",
          description: profile.profile_description,
          name: profile.display_name,
          username: profile.username,
          avatar_url: profile.avatar,
          banner_url: profile.banner,
        })}
      </script>
    </Helmet>
  )
}
