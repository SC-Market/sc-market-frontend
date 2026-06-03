import { FlatSection } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import {
  useGetUserProfileQuery,
  useProfileUpdateSettingsMutation,
  useAccountDeletionStatusQuery,
} from "../../features/profile/api/profileApi"
import {
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from "@mui/material"
import { AccountSettingsBody } from "../../hooks/login/UserProfile"
import { BACKEND_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { DeleteAccountDialog } from "../../features/account-deletion/components/DeleteAccountDialog"
import { PendingDeletionBanner } from "../../features/account-deletion/components/PendingDeletionBanner"

export function PrivacySettings() {
  const { data: profile, refetch } = useGetUserProfileQuery()
  const [updateProfile] = useProfileUpdateSettingsMutation()
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: deletionStatus } = useAccountDeletionStatusQuery()

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
    <>
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

      <Divider sx={{ my: 3 }} />

      <FlatSection
        title={t("privacy_settings.danger_zone", {
          defaultValue: "Danger Zone",
        })}
      >
        {deletionStatus?.pending && deletionStatus.scheduledAt && (
          <Grid item>
            <PendingDeletionBanner scheduledAt={deletionStatus.scheduledAt} />
          </Grid>
        )}
        <Grid item>
          <Typography variant="body2" color="text.secondary">
            {t("privacy_settings.delete_account_description", {
              defaultValue:
                "Permanently delete your account and all associated personal data. This action cannot be undone after the 30-day grace period.",
            })}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="error"
            variant="outlined"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deletionStatus?.pending}
          >
            {t("privacy_settings.delete_account_button", {
              defaultValue: "Delete Account",
            })}
          </Button>
        </Grid>
      </FlatSection>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  )
}
