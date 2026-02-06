import { IconButton, IconButtonProps } from "@mui/material"
import { haptic } from "../../util/haptics"

export function HapticIconButton(props: IconButtonProps) {
  const { onClick, ...rest } = props

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    haptic.light()
    onClick?.(event)
  }

  return <IconButton {...rest} onClick={handleClick} />
}
