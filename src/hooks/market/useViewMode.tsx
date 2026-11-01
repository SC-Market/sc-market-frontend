import { useTranslation } from "react-i18next"
import { ToggleButtonGroup, ToggleButton } from "@mui/material"
import { GridViewRounded, ViewListRounded } from "@mui/icons-material"
import { useLocalStorageState } from "../storage/useLocalStorageState"

export type ViewMode = "grid" | "list"

const STORAGE_KEY = "market_view_mode"
const VIEW_MODES: readonly ViewMode[] = ["grid", "list"]

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  return useLocalStorageState<ViewMode>(STORAGE_KEY, "grid", VIEW_MODES)
}

export function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const { t } = useTranslation()
  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      size="small"
      color="secondary"
    >
      <ToggleButton value="grid" aria-label={t("marketV2.gridView")}><GridViewRounded fontSize="small" /></ToggleButton>
      <ToggleButton value="list" aria-label={t("marketV2.listView")}><ViewListRounded fontSize="small" /></ToggleButton>
    </ToggleButtonGroup>
  )
}
