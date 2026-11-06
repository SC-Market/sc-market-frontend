import { Fab } from "@mui/material"
import { FilterListRounded } from "@mui/icons-material"
import React from "react"
import { haptic } from "../../util/haptics"
import { FloatingAction } from "../layout/FloatingActions"

interface FiltersFABProps {
  onClick: () => void
  label?: string
}

export function FiltersFAB({ onClick, label = "Filters" }: FiltersFABProps) {
  const handleClick = () => {
    haptic.light()
    onClick()
  }

  return (
    // Stacked with the app's other floating buttons (FloatingActions)
    <FloatingAction>
      <Fab color="primary" aria-label={label} onClick={handleClick}>
        <FilterListRounded />
      </Fab>
    </FloatingAction>
  )
}
