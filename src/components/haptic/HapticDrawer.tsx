import { Drawer, DrawerProps } from "@mui/material"
import { haptic } from "../../util/haptics"
import { useEffect } from "react"

export function HapticDrawer(props: DrawerProps) {
  const { open, ...rest } = props

  useEffect(() => {
    if (open) {
      haptic.light()
    }
  }, [open])

  return <Drawer {...rest} open={open} />
}
