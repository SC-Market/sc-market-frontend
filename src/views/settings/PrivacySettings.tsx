import { FlatSection } from "../../components/paper/Section"
import React, { useCallback } from "react"
import {
  useGetUserProfileQuery,
  useProfileUpdateSettingsMutation,
} from "../../store/profile"
import { AccountSettingsBody } from "../../hooks/login/UserProfile"
import { BACKEND_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"

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

export function PrivacySettings() {
  const { data: profile, refetch } = useGetUserProfileQuery()
  const [updateProfile] = useProfileUpdateSettingsMutation()
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const handleUpdate = useCallback(
    (body: AccountSettingsBody) => {
      updateProfile(body)
        .unwrap()
        .then(() => {
          issueAlert({
            message: t("privacy_settings.updated", {
              defaultValue: "Settings updated successfully",
            }),
            severity: "success",
          })
          refetch()
        })
        .catch(issueAlert)
    },
    [updateProfile, refetch, issueAlert, t],
  )

  return (
    <FlatSection title={t("privacy_settings.title")}>
      <Grid item>
        <FormControlLabel
          control={
            <Switch
              color="primary"
              checked={profile?.settings?.discord_public}
              onChange={(event) =>
                handleUpdate({ discord_public: event.target.checked })
              }
            />
          }
          label={t("privacy_settings.public_discord")}
          labelPlacement="start"
        />
      </Grid>
      <Grid item>
        <FormControlLabel
          control={
            <Switch
              color="primary"
              checked={profile?.settings?.discord_order_share}
              onChange={(event) =>
                handleUpdate({ discord_order_share: event.target.checked })
              }
            />
          }
          label={t("privacy_settings.share_discord_with_sellers")}
          labelPlacement="start"
        />
      </Grid>
      <Grid item>
        <Typography variant={"subtitle1"} color={"text.secondary"}>
          {t("privacy_settings.request_data_title")}
        </Typography>
        <Typography variant={"body2"}>
          {t("privacy_settings.request_data_description")}
        </Typography>
      </Grid>
      <Grid item>
        <Button href={`${BACKEND_URL}/api/profile/my_data`} target={"_blank"}>
          {t("privacy_settings.request_data_button")}
        </Button>
      </Grid>
    </FlatSection>
  )
}
