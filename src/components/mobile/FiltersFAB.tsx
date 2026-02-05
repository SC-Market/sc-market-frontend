import { Fab } from "@mui/material"
import { FilterList } from "@mui/icons-material"
import React from "react"

interface FiltersFABProps {
  onClick: () => void
  label?: string
}

export function FiltersFAB({ onClick, label = "Filters" }: FiltersFABProps) {
  return (
    <Fab
      color="primary"
      aria-label={label}
      onClick={onClick}
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
