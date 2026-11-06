/**
 * VersionSelector - Game version selector component
 *
 * Allows users to select between LIVE, PTU, and EPTU game versions.
 * Persists selection to localStorage and displays last update timestamp.
 *
 * Requirements: 13.1-13.6, 45.1-45.10
 */

import React, { useState, useEffect } from "react"
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Chip,
  useTheme,
  Tooltip,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import UpdateIcon from "@mui/icons-material/UpdateRounded"
import {
  useGetActiveVersionsQuery,
  type GameVersion,
} from "../../features/game-data/api/gameDataApi"
import { useSelectGameVersion } from "../../features/game-data/hooks/useGameDataActions"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { useNow } from "../../util/format"

interface VersionSelectorProps {
  /** Callback when version changes */
  onVersionChange?: (versionId: string, versionType: string) => void
  /** Show compact version (no label) */
  compact?: boolean
  /** Custom width */
  width?: string | number
}

const VERSION_STORAGE_KEY = "sc-market-selected-version"

/**
 * VersionSelector Component
 *
 * Features:
 * - Dropdown with LIVE/PTU/EPTU options (45.2, 45.3)
 * - Displays full version number including build (45.4)
 * - Shows last data update timestamp (45.5)
 * - Persists selection across sessions (13.3, 45.6)
 * - Visual distinction for version types (45.3)
 * - Defaults to LIVE for new users (13.6)
 */
export const VersionSelector: React.FC<VersionSelectorProps> = ({
  onVersionChange,
  compact = false,
  width = 300,
}) => {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const now = useNow()
  const { data: activeVersions, isLoading } = useGetActiveVersionsQuery()
  const persistVersion = useSelectGameVersion()

  const [selectedVersionId, setSelectedVersionId] = useState<string>("")

  // Load persisted version on mount
  useEffect(() => {
    if (!activeVersions) return

    const stored = localStorage.getItem(VERSION_STORAGE_KEY)

    if (stored) {
      // Verify stored version still exists
      const allVersions = [
        activeVersions.LIVE,
        activeVersions.PTU,
        activeVersions.EPTU,
      ].filter(Boolean)

      const exists = allVersions.some((v) => v?.version_id === stored)
      if (exists) {
        setSelectedVersionId(stored)
        return
      }
    }

    // Default to LIVE version (13.6)
    if (activeVersions.LIVE) {
      setSelectedVersionId(activeVersions.LIVE.version_id)
      localStorage.setItem(VERSION_STORAGE_KEY, activeVersions.LIVE.version_id)
    }
  }, [activeVersions])

  const handleVersionChange = async (versionId: string) => {
    setSelectedVersionId(versionId)
    localStorage.setItem(VERSION_STORAGE_KEY, versionId)

    // Find version type
    const versionType =
      Object.entries(activeVersions || {}).find(
        ([, version]) => version?.version_id === versionId,
      )?.[0] || "LIVE"

    // Call API to persist selection (if authenticated)
    await persistVersion(versionId)

    onVersionChange?.(versionId, versionType)
  }

  // Get version type color
  const getVersionColor = (type: string): string => {
    switch (type) {
      case "LIVE":
        return theme.palette.success.main
      case "PTU":
        return theme.palette.warning.main
      case "EPTU":
        return theme.palette.error.main
      default:
        return theme.palette.grey[500]
    }
  }

  // Format version display
  const formatVersion = (version: GameVersion | undefined): string => {
    if (!version) return ""
    const parts = [version.version_number]
    if (version.build_number) {
      parts.push(version.build_number)
    }
    return parts.join("-")
  }

  // Format last update timestamp
  const formatLastUpdate = (timestamp?: string): string => {
    if (!timestamp) return t("wikiUi.versionSelector.unknown")
    const date = new Date(timestamp)
    const diffMs = now - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return t("wikiUi.versionSelector.daysAgo", { count: diffDays })
    } else if (diffHours > 0) {
      return t("wikiUi.versionSelector.hoursAgo", { count: diffHours })
    } else {
      return t("wikiUi.versionSelector.recently")
    }
  }

  // Compact mode has no visible label: name the combobox directly (its
  // default aria-labelledby points at its own value text).
  const compactNameProps = compact
    ? ({
        "aria-label": t("wikiUi.versionSelector.ariaLabel"),
        "aria-labelledby": undefined,
      } as React.HTMLAttributes<HTMLDivElement>)
    : undefined

  if (isLoading || !activeVersions) {
    return (
      <Box sx={{ width }}>
        <TextField
          select
          fullWidth
          size="small"
          label={compact ? undefined : t("wikiUi.versionSelector.label")}
          disabled
          value=""
          SelectProps={{ SelectDisplayProps: compactNameProps }}
        >
          <MenuItem value="">{t("accessibility.loading")}</MenuItem>
        </TextField>
      </Box>
    )
  }

  const versions = [
    { type: "LIVE", data: activeVersions.LIVE },
    { type: "PTU", data: activeVersions.PTU },
    { type: "EPTU", data: activeVersions.EPTU },
  ].filter((v) => v.data)

  const selectedVersion = versions.find(
    (v) => v.data?.version_id === selectedVersionId,
  )

  return (
    <Box sx={{ width }}>
      <TextField
        select
        fullWidth
        size="small"
        label={compact ? undefined : t("wikiUi.versionSelector.label")}
        value={selectedVersionId}
        onChange={(e) => handleVersionChange(e.target.value)}
        SelectProps={{
          SelectDisplayProps: compactNameProps,
          IconComponent: KeyboardArrowDownRoundedIcon,
          renderValue: (value) => {
            const version = versions.find((v) => v.data?.version_id === value)
            if (!version) return ""

            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={version.type}
                  size="small"
                  sx={{
                    backgroundColor: getVersionColor(version.type),
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
                <Typography variant="body2">
                  {formatVersion(version.data)}
                </Typography>
              </Box>
            )
          },
        }}
      >
        {versions.map((version) => (
          <MenuItem
            key={version.data!.version_id}
            value={version.data!.version_id}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={version.type}
                  size="small"
                  sx={{
                    backgroundColor: getVersionColor(version.type),
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
                <Typography variant="body2">
                  {formatVersion(version.data)}
                </Typography>
              </Box>
              <Tooltip
                title={t("wikiUi.versionSelector.lastUpdated", {
                  time: formatLastUpdate(version.data!.last_data_update),
                })}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "text.secondary",
                  }}
                >
                  <UpdateIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">
                    {formatLastUpdate(version.data!.last_data_update)}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </MenuItem>
        ))}
      </TextField>

      {/* Display current selection info */}
      {selectedVersion && !compact && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {t("wikiUi.versionSelector.lastUpdated", {
            time: formatLastUpdate(selectedVersion.data!.last_data_update),
          })}
        </Typography>
      )}
    </Box>
  )
}
