import { Switch, FormControlLabel } from "@mui/material"
import { useSetInGameStatus } from "../hooks/useProfileStatusActions"
import { useGetUserProfileQuery } from "../api/profileApi"
import { useTranslation } from "react-i18next"

export function InGameToggle() {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const setInGame = useSetInGameStatus()

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInGame(e.target.checked)
  }

  return (
    <FormControlLabel
      control={
        <Switch checked={profile?.in_game || false} onChange={handleToggle} />
      }
      label={t("settings.profile.showAsInGame")}
    />
  )
}
