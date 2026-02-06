import { Menu, MenuProps } from "@mui/material"
import { haptic } from "../../util/haptics"
import { useEffect } from "react"

export function HapticMenu(props: MenuProps) {
  const { open, ...rest } = props

  useEffect(() => {
    if (open) {
      haptic.light()
    }
  }, [open])

  return <Menu {...rest} open={open} />
}
