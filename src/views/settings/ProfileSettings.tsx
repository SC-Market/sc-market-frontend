import React from "react"
import {
  useGetUserProfileQuery,
  useProfileGetLinksQuery,
} from "../../store/profile"
import { AuthenticateRSI } from "../authentication/AuthenticateRSI"
import { ReVerifyProfile } from "./ReVerifyProfile"
import { UnlinkProfile } from "./UnlinkProfile"
import { AccountLinks } from "./AccountLinks"
import { LanguageSettings } from "./LanguageSettings"
import { isCitizenIdEnabled } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';

export function ProfileSettings() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: profile } = useGetUserProfileQuery()
  const { data: links } = useProfileGetLinksQuery()

  // Check if Citizen iD is linked - if so, hide unlink section
  // Citizen iD is the authoritative source for RSI details when linked
  // Only check if feature is enabled
  const hasCitizenID =
    isCitizenIdEnabled && Array.isArray(links)
      ? links.some((link) => link.provider_type === "citizenid")
      : false

  // If user is not verified, show both verification options
  if (!profile?.rsi_confirmed) {
    return (
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            {t("settings.profile.verifyAccount", "Verify Your Account")}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t(
              "settings.profile.verifyAccountDescription",
              "You need to verify your account to access all features. Choose one of the following methods:",
            )}
          </Typography>
        </Grid>

        {isCitizenIdEnabled && (
          <>
            <Grid item xs={12}>
              <AccountLinks />
            </Grid>
            <Grid item xs={12}>
              <Divider>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.profile.or", "OR")}
                </Typography>
              </Divider>
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t("settings.profile.manualVerification", "Manual Verification")}
          </Typography>
          <AuthenticateRSI />
        </Grid>
      </Grid>
    )
  }

  // User is verified - show normal settings
  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12}>
        <AccountLinks />
      </Grid>
      <Grid item xs={12}>
        <ReVerifyProfile />
      </Grid>
      {!hasCitizenID && (
        <Grid item xs={12}>
          <UnlinkProfile />
        </Grid>
      )}
      <Grid item xs={12}>
        <LanguageSettings />
      </Grid>
    </Grid>
  )
}
