import { Fab } from "@mui/material"
import { FilterList } from "@mui/icons-material"
import React from "react"
import { haptic } from "../../util/haptics"

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
    <Fab
      color="primary"
      aria-label={label}
      onClick={handleClick}
      sx={{
        position: "fixed",
        bottom: 80,
        right: 16,
        zIndex: 1000,
      }}
    >
      <FilterList />
    </Fab>
  )
}
