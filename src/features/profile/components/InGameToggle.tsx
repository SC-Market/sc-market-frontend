import { LabeledSwitch } from "../../../components/buttons/LabeledSwitch"
import { useSetInGameStatus } from "../hooks/useProfileStatusActions"
import { useGetUserProfileQuery } from "../api/profileApi"
import { useTranslation } from "react-i18next"

export function InGameToggle() {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const setInGame = useSetInGameStatus()

  return (
    <LabeledSwitch
      checked={profile?.in_game || false}
      onChange={(checked) => setInGame(checked)}
      label={t("settings.profile.showAsInGame")}
    />
  )
}
