import { Button, ButtonProps } from "@mui/material"
import { haptic } from "../../util/haptics"

export function HapticButton(props: ButtonProps) {
  const { onClick, ...rest } = props

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    haptic.light()
    onClick?.(event)
  }

  return <Button {...rest} onClick={handleClick} />
}
