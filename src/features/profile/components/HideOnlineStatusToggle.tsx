import { useId } from "react"
import { Stack, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { LabeledSwitch } from "../../../components/buttons/LabeledSwitch"
import { useGetAccountPrivacyQuery } from "../../../store/api/v2/market"
import { useHideOnlineStatus } from "../hooks/useProfileStatusActions"

/**
 * "Hide my online status": buyers then never see when you were last active
 * (on your shops' listings and shop page, or an org shop you help run).
 */
export function HideOnlineStatusToggle() {
  const { t } = useTranslation()
  const helpId = useId()
  const { data, isLoading } = useGetAccountPrivacyQuery()
  const { setHidden, saving } = useHideOnlineStatus()

  return (
    <Stack spacing={0}>
      <LabeledSwitch
        checked={!!data?.hide_online_status}
        disabled={isLoading || saving}
        onChange={(checked) => setHidden(checked)}
        describedBy={helpId}
        label={t("settings.profile.hideOnlineStatus", "Hide my online status")}
      />
      <Typography
        id={helpId}
        variant="caption"
        color="text.secondary"
        sx={{ ml: 6 }}
      >
        {t(
          "settings.profile.hideOnlineStatusHelp",
          'Buyers see roughly when you were last active (for example "Active today") on your listings and shop. Turn this on to hide it.',
        )}
      </Typography>
    </Stack>
  )
}
