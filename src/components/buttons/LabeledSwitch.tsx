import React, { useId } from "react"
import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
  type FormControlLabelProps,
  type SwitchProps,
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"

export interface LabeledSwitchProps {
  /** Visible label. Clicking it toggles the switch, and it names the switch. */
  label: React.ReactNode
  checked: boolean
  onChange: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void
  /** Help text under the label; screen readers read it as the description. */
  helperText?: React.ReactNode
  /** Id of a description shown elsewhere on the page (aria-describedby). */
  describedBy?: string
  /** Overrides the accessible name when the visible label needs context. */
  ariaLabel?: string
  /** Keep the label for screen readers only (e.g. a switch in a table cell). */
  hideLabel?: boolean
  disabled?: boolean
  size?: SwitchProps["size"]
  color?: SwitchProps["color"]
  labelPlacement?: FormControlLabelProps["labelPlacement"]
  sx?: FormControlLabelProps["sx"]
  "data-testid"?: string
}

/** An on/off switch with its label (the label names it for screen readers too). */
export function LabeledSwitch(props: LabeledSwitchProps) {
  const {
    label,
    checked,
    onChange,
    helperText,
    describedBy,
    ariaLabel,
    hideLabel,
    disabled,
    size,
    color,
    labelPlacement,
    sx,
  } = props
  const id = useId()
  const labelId = `${id}-label`
  const helperId = `${id}-helper`
  const hasHelper = helperText != null && !hideLabel
  const describedByIds =
    [hasHelper ? helperId : undefined, describedBy].filter(Boolean).join(" ") ||
    undefined

  let shownLabel: React.ReactNode = label
  if (hideLabel) {
    shownLabel = (
      <Box component="span" sx={visuallyHidden}>
        {label}
      </Box>
    )
  } else if (hasHelper) {
    // The help text sits inside the clickable label, so name the switch by
    // the label part only and attach the help text as its description.
    shownLabel = (
      <Stack>
        <Box id={labelId}>{label}</Box>
        <Typography id={helperId} variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      </Stack>
    )
  }

  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked, e)}
          disabled={disabled}
          size={size}
          color={color}
          inputProps={{
            "aria-label": ariaLabel,
            "aria-labelledby": hasHelper && !ariaLabel ? labelId : undefined,
            "aria-describedby": describedByIds,
          }}
          data-testid={props["data-testid"]}
        />
      }
      label={shownLabel}
      labelPlacement={labelPlacement}
      sx={hideLabel ? [{ m: 0 }, ...(Array.isArray(sx) ? sx : [sx])] : sx}
    />
  )
}
