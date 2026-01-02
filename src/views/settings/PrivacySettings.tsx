import { FlatSection } from "../../components/paper/Section"
import React, { useCallback } from "react"
import {
  useGetUserProfileQuery,
  useProfileUpdateSettingsMutation,
} from "../../store/profile"
import {
  Button,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from "@mui/material"
import { AccountSettingsBody } from "../../hooks/login/UserProfile"
import { BACKEND_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"

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
