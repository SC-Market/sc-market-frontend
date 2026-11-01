import { FormControlLabel, Stack, Switch, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetAccountPrivacyQuery,
  useUpdateAccountPrivacyMutation,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"

/**
 * "Hide my online status": buyers then never see when you were last active
 * (on your shops' listings and shop page, or an org shop you help run).
 */
export function HideOnlineStatusToggle() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const { data, isLoading } = useGetAccountPrivacyQuery()
  const [update, { isLoading: saving }] = useUpdateAccountPrivacyMutation()

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await update({
        updateAccountPrivacyRequest: { hide_online_status: e.target.checked },
      }).unwrap()
    } catch {
      issueAlert({
        message: t(
          "settings.profile.hideOnlineStatusError",
          "Couldn't save your online status setting",
        ),
        severity: "error",
      })
    }
  }

  return (
    <Stack spacing={0}>
      <FormControlLabel
        control={
          <Switch
            checked={!!data?.hide_online_status}
            disabled={isLoading || saving}
            onChange={onChange}
          />
        }
        label={t("settings.profile.hideOnlineStatus", "Hide my online status")}
      />
      <Typography variant="caption" color="text.secondary" sx={{ ml: 6 }}>
        {t(
          "settings.profile.hideOnlineStatusHelp",
          "Buyers see roughly when you were last active (for example \"Active today\") on your listings and shop. Turn this on to hide it.",
        )}
      </Typography>
    </Stack>
  )
}
