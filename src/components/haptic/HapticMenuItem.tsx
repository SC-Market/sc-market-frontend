import { MenuItem, MenuItemProps } from "@mui/material"
import { haptic } from "../../util/haptics"

export function HapticMenuItem(props: MenuItemProps) {
  const { onClick, ...rest } = props

  const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
    haptic.selection()
    onClick?.(event)
  }

  return <MenuItem {...rest} onClick={handleClick} />
}
