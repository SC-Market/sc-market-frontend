import { Switch, FormControlLabel } from "@mui/material"
import { useProfileUpdateInGameStatusMutation } from "../../../store/profile"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useTranslation } from "react-i18next"

export function InGameToggle() {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const [updateStatus] = useProfileUpdateInGameStatusMutation()

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateStatus({ in_game: e.target.checked })
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
