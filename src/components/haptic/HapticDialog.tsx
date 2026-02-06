import { Dialog, DialogProps } from "@mui/material"
import { haptic } from "../../util/haptics"
import { useEffect } from "react"

export function HapticDialog(props: DialogProps) {
  const { open, ...rest } = props

  useEffect(() => {
    if (open) {
      haptic.light()
    }
  }, [open])

  return <Dialog {...rest} open={open} />
}
