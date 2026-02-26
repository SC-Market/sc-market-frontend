import { Switch, FormControlLabel } from "@mui/material"
import { useProfileUpdateInGameStatusMutation } from "../../../store/profile"
import { useProfile } from "../../../hooks/login/UserProfile"

export function InGameToggle() {
  const { profile } = useProfile()
  const [updateStatus] = useProfileUpdateInGameStatusMutation()

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateStatus({ in_game: e.target.checked })
  }

  return (
    <FormControlLabel
      control={
        <Switch checked={profile?.in_game || false} onChange={handleToggle} />
      }
      label="Show as In Game"
    />
  )
}
