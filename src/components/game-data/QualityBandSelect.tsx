import React from "react"
import { TextField, MenuItem } from "@mui/material"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { type QualityBand } from "../../store/api/v2/market"

interface QualityBandSelectProps {
  bands: QualityBand[]
  value: number | null | undefined
  onChange: (value: number | null) => void
  label?: string
  allowAny?: boolean
  size?: "small" | "medium"
  fullWidth?: boolean
  disabled?: boolean
}

export function QualityBandSelect({
  bands,
  value,
  onChange,
  label = "Quality",
  allowAny = true,
  size = "small",
  fullWidth = true,
  disabled = false,
}: QualityBandSelectProps) {
  return (
    <TextField
      select
      fullWidth={fullWidth}
      size={size}
      color="secondary"
      label={label}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === "" ? null : Number(v))
      }}
      disabled={disabled}
      SelectProps={{ IconComponent: KeyboardArrowDownRoundedIcon }}
    >
      {allowAny && <MenuItem value="">Any</MenuItem>}
      {bands.map((band) => (
        <MenuItem key={band.mappedValue} value={band.mappedValue}>
          {band.mappedValue} ({band.start}–{band.end})
        </MenuItem>
      ))}
    </TextField>
  )
}
