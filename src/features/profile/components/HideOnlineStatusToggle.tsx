import { FormControlLabel, Stack, Switch, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetAccountPrivacyQuery } from "../../../store/api/v2/market"
import { useHideOnlineStatus } from "../hooks/useProfileStatusActions"

/**
 * "Hide my online status": buyers then never see when you were last active
 * (on your shops' listings and shop page, or an org shop you help run).
 */
export function HideOnlineStatusToggle() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetAccountPrivacyQuery()
  const { setHidden, saving } = useHideOnlineStatus()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setHidden(e.target.checked)

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
          'Buyers see roughly when you were last active (for example "Active today") on your listings and shop. Turn this on to hide it.',
        )}
      </Typography>
    </Stack>
  )
}
