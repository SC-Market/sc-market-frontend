import { Switch, SwitchProps } from "@mui/material"
import { haptic } from "../../util/haptics"

export function HapticSwitch(props: SwitchProps) {
  const { onChange, ...rest } = props

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    haptic.selection()
    onChange?.(event, checked)
  }

  return <Switch {...rest} onChange={handleChange} />
}
