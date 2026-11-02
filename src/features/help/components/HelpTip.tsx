import React, { useState } from "react"
import {
  ClickAwayListener,
  IconButton,
  Tooltip,
  type SxProps,
  type Theme,
} from "@mui/material"
import { HelpOutlineRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

/**
 * A "?" button next to a field or option that explains it in a tooltip.
 *
 * Works without a mouse: it is a real button, so Tab focuses it and the
 * explanation opens on focus; Enter/Space or a tap toggles it, Escape or a
 * tap elsewhere closes it. Screen readers get the explanation as the
 * button's description. Put it next to a label, not inside one (a click
 * inside a <label> would also toggle its checkbox).
 */
export function HelpTip(props: {
  /** What the explanation is about, for the button's name ("Help: {{label}}"). */
  label: string
  /** The explanation: one or two sentences. */
  title: React.ReactNode
  placement?: "top" | "bottom" | "left" | "right"
  sx?: SxProps<Theme>
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Tooltip
        title={props.title}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        placement={props.placement ?? "top"}
        arrow
        describeChild
        enterTouchDelay={0}
        leaveTouchDelay={6000}
        slotProps={{
          popper: { sx: { maxWidth: "min(320px, calc(100vw - 32px))" } },
        }}
      >
        <IconButton
          size="small"
          aria-label={t("help.tip.label", "Help: {{label}}", {
            label: props.label,
          })}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen((o) => !o)
          }}
          sx={[
            { p: 0.5, color: "text.primary", verticalAlign: "middle" },
            ...(Array.isArray(props.sx)
              ? props.sx
              : props.sx
                ? [props.sx]
                : []),
          ]}
        >
          <HelpOutlineRounded sx={{ fontSize: "1.1rem" }} />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  )
}
