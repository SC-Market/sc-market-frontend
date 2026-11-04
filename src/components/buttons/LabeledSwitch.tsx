import React from "react"
import { FormControlLabel, Switch } from "@mui/material"

/** An on/off switch with its visible label (the label names it for screen readers too). */
export function LabeledSwitch(props: {
  label: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const { label, checked, onChange } = props
  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={label}
    />
  )
}
