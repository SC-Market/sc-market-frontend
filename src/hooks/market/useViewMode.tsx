import { useState, useCallback } from "react"
import { ToggleButtonGroup, ToggleButton } from "@mui/material"
import { GridViewRounded, ViewListRounded } from "@mui/icons-material"

export type ViewMode = "grid" | "list"

const STORAGE_KEY = "market_view_mode"

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setModeState] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored === "list" ? "list" : "grid"
    } catch {
      return "grid"
    }
  })

  const setMode = useCallback((m: ViewMode) => {
    setModeState(m)
    try { localStorage.setItem(STORAGE_KEY, m) } catch {}
  }, [])

  return [mode, setMode]
}

export function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      size="small"
      color="secondary"
    >
      <ToggleButton value="grid" aria-label="Grid view"><GridViewRounded fontSize="small" /></ToggleButton>
      <ToggleButton value="list" aria-label="List view"><ViewListRounded fontSize="small" /></ToggleButton>
    </ToggleButtonGroup>
  )
}
