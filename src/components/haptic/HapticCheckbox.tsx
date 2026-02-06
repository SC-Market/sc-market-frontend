import { Checkbox, CheckboxProps } from "@mui/material"
import { haptic } from "../../util/haptics"

export function HapticCheckbox(props: CheckboxProps) {
  const { onChange, ...rest } = props

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    haptic.selection()
    onChange?.(event, checked)
  }

  return <Checkbox {...rest} onChange={handleChange} />
}
