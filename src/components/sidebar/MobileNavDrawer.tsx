import React, { useEffect, useState } from "react"
import { Drawer, useTheme } from "@mui/material"

/**
 * The phone nav drawer (a temporary, modal MUI Drawer).
 *
 * It always mounts closed. MUI's Modal decides whether its root is hidden
 * from an `exited` flag that starts as `!open` and only becomes true again
 * when the Slide's `onExited` fires. Its Portal renders the children one
 * render after the Modal mounts, so a Drawer that mounts open and is closed
 * in the same tick (on a prerendered page: the drawer state is seeded open
 * from the desktop hydration render, then re-seeded closed right after) gets
 * a Slide that mounts already closed, never fires `onExited`, and leaves an
 * invisible full-screen root over the page that swallows every tap and
 * scroll. Opening only after the first mobile commit avoids that.
 *
 * As a second line of defence, the closed root never takes pointer events
 * and turns hidden once the slide-out is over.
 */
export function MobileNavDrawer(props: {
  open: boolean
  onClose: () => void
  keepMounted: boolean
  width: number
  children: React.ReactNode
}) {
  const theme = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const open = mounted && props.open

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={props.onClose}
      ModalProps={{ keepMounted: props.keepMounted }}
      sx={{
        zIndex: theme.zIndex.modal + 1,
        "& .MuiDrawer-paper": { width: props.width },
        ...(open
          ? {}
          : {
              pointerEvents: "none",
              visibility: "hidden",
              transition: `visibility 0s linear ${theme.transitions.duration.leavingScreen}ms`,
            }),
      }}
    >
      {props.children}
    </Drawer>
  )
}
