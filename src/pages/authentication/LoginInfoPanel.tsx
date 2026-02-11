import React from "react"
import Screencap from "../../assets/screencap.webp"
import Screencap2 from "../../assets/screencap2.webp"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';

export function LoginInfoPanel() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <>
      <Grid item xs={12}>
        {/*This is the login info panel.*/}

        <img
          src={Screencap}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: `${theme.spacing(theme.borderRadius.image)}px`,
          }}
          alt={t("loginInfoPanel.dashboardScreenshot")}
          loading="lazy"
        />
      </Grid>
      <Grid item xs={12}>
        {/*This is the login info panel.*/}

        <img
          src={Screencap2}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: `${theme.spacing(theme.borderRadius.image)}px`,
          }}
          alt={t("loginInfoPanel.dashboardScreenshot")}
          loading="lazy"
        />
      </Grid>
    </>
  )
}
