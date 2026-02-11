import React, { useState, useEffect } from "react"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { User } from "../../../datatypes/User"
import { Contractor } from "../../../datatypes/Contractor"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

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
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';

export function LightBannerContainer(props: {
  children?: React.ReactNode
  profile: User | Contractor
}) {
  const { profile } = props
  const theme = useTheme<ExtendedTheme>()
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (profile.banner) {
      const img = new Image()
      img.src = profile.banner
      img.onload = () => setImageLoaded(true)
    }
  }, [profile.banner])

  return (
    <Paper
      sx={{
        height: 250,
        background: imageLoaded
          ? `url(${profile.banner})`
          : theme.palette.background.paper,
        backgroundPosition: "center",
        backgroundSize: "cover",
        borderRadius: 0,
        position: "relative",
        padding: 3,
        transition: "background 0.3s ease-in-out",
      }}
    >
      {props.children}
    </Paper>
  )
}

export function DarkBannerContainer(props: {
  children?: React.ReactNode
  profile: User | Contractor
}) {
  const { profile } = props
  const theme = useTheme<ExtendedTheme>()
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (profile.banner) {
      const img = new Image()
      img.src = profile.banner
      img.onload = () => setImageLoaded(true)
    }
  }, [profile.banner])

  return (
    <Paper
      sx={{
        height: 500,
        background: imageLoaded
          ? `url(${profile.banner})`
          : theme.palette.background.paper,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 0,
        position: "relative",
        padding: 3,
        transition: "background 0.3s ease-in-out",
      }}
    >
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          height: 500,
          top: 0,
          left: 0,
          background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default}99 60%, ${theme.palette.background.default} 100%)`,
        }}
      />
      {props.children}
    </Paper>
  )
}
