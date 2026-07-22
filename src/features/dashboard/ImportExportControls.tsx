/**
 * Export / import controls for a dashboard (plan §5, M5).
 *
 * Export downloads the current config as JSON. Import reads a file, and if it
 * contains widgets pinned to a specific org/shop (which reference the author's
 * ids) it prompts the importer to remap each to one of their own orgs/shops or
 * drop it. Portable-scoped widgets import with no prompt.
 */

import { useMemo, useRef, useState } from "react"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import UploadIcon from "@mui/icons-material/Upload"
import { useTranslation } from "react-i18next"
import { useGetMyShopsQuery } from "../../store/api/v2/market"
import { useGetUserProfileQuery } from "../profile/api/profileApi"
import { getWidgetDefinition, widgetTitle } from "./widgets/registry"
import {
  applyRemaps,
  downloadConfig,
  parseImport,
  type ParsedImport,
  type RemapResolution,
} from "./importExport"
import type { DashboardConfig } from "./types"

export interface ImportExportControlsProps {
  config: DashboardConfig
  /** Used to name the exported file. */
  name: string
  onImport: (next: DashboardConfig) => void
}

export function ImportExportControls({
  config,
  name,
  onImport,
}: ImportExportControlsProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<ParsedImport | null>(null)

  const handleFile = async (file: File) => {
    const text = await file.text()
    const result = parseImport(text)
    if (result.remaps.length === 0) {
      // Nothing to remap — import straight away.
      onImport(result.config)
      return
    }
    setParsed(result)
  }

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={() => downloadConfig(config, name)}
        disabled={config.widgets.length === 0}
      >
        {t("dashboard.export", "Export")}
      </Button>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<UploadIcon />}
        onClick={() => fileInputRef.current?.click()}
      >
        {t("dashboard.import", "Import")}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          // Reset so selecting the same file again re-triggers onChange.
          e.target.value = ""
        }}
      />
      {parsed && (
        <RemapDialog
          parsed={parsed}
          onClose={() => setParsed(null)}
          onConfirm={(resolutions) => {
            onImport(applyRemaps(parsed, resolutions))
            setParsed(null)
          }}
        />
      )}
    </>
  )
}

interface RemapDialogProps {
  parsed: ParsedImport
  onClose: () => void
  onConfirm: (resolutions: Record<number, RemapResolution>) => void
}

const DROP = "__drop__"

function RemapDialog({ parsed, onClose, onConfirm }: RemapDialogProps) {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const { data: myShops } = useGetMyShopsQuery()
  const orgs = profile?.contractors ?? []
  const shops = myShops ?? []

  // Per-remap selection. Value is a shop_id / spectrum_id, or DROP.
  const [choices, setChoices] = useState<Record<number, string>>({})

  const resolutions = useMemo<Record<number, RemapResolution>>(() => {
    const out: Record<number, RemapResolution> = {}
    for (const remap of parsed.remaps) {
      const choice = choices[remap.index] ?? DROP
      if (choice === DROP) {
        out[remap.index] = { action: "drop" }
      } else if (remap.kind === "specific_org") {
        out[remap.index] = { action: "org", spectrumId: choice }
      } else {
        out[remap.index] = { action: "shop", shopId: choice }
      }
    }
    return out
  }, [choices, parsed.remaps])

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("dashboard.mapImportedWidgets", "Map imported widgets")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {t(
            "dashboard.mapImportedWidgetsHint",
            "These widgets were pinned to the author's own organizations or shops. Pick one of yours for each, or drop it.",
          )}
        </DialogContentText>
        <Stack spacing={2}>
          {parsed.remaps.map((remap) => {
            const def = getWidgetDefinition(remap.widgetType)
            const isOrg = remap.kind === "specific_org"
            const options = isOrg ? orgs : shops
            const widgetName = def ? widgetTitle(def, t) : remap.widgetType
            const label = isOrg
              ? t("dashboard.remapOrgLabel", "{{name}} — organization", {
                  name: widgetName,
                })
              : t("dashboard.remapShopLabel", "{{name}} — shop", {
                  name: widgetName,
                })
            return (
              <FormControl key={remap.index} fullWidth size="small">
                <InputLabel id={`remap-${remap.index}`}>{label}</InputLabel>
                <Select
                  labelId={`remap-${remap.index}`}
                  label={label}
                  value={choices[remap.index] ?? DROP}
                  onChange={(e) =>
                    setChoices((c) => ({
                      ...c,
                      [remap.index]: e.target.value,
                    }))
                  }
                >
                  <MenuItem value={DROP}>
                    <em>
                      {t("dashboard.dontImportWidget", "Don't import this widget")}
                    </em>
                  </MenuItem>
                  {isOrg
                    ? orgs.map((org) => (
                        <MenuItem key={org.spectrum_id} value={org.spectrum_id}>
                          {org.name || org.spectrum_id}
                        </MenuItem>
                      ))
                    : shops.map((shop) => (
                        <MenuItem key={shop.shop_id} value={shop.shop_id}>
                          {shop.name}
                        </MenuItem>
                      ))}
                </Select>
                {options.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {isOrg
                      ? t(
                          "dashboard.noOrgsWidgetDropped",
                          "You have no organizations — this widget will be dropped.",
                        )
                      : t(
                          "dashboard.noShopsWidgetDropped",
                          "You have no shops — this widget will be dropped.",
                        )}
                  </Typography>
                )}
              </FormControl>
            )
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("dashboard.cancel", "Cancel")}</Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onConfirm(resolutions)}
        >
          {t("dashboard.import", "Import")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
