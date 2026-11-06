import React from "react"
import { Tooltip, useTheme } from "@mui/material"
import { useTranslation } from "react-i18next"

interface SentinelCodeProps {
  code: string
}

export function SentinelCode({ code }: SentinelCodeProps) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Tooltip title={t("authenticateRSI.click_to_copy", "Click to copy")}>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
          } catch {
            // Clipboard API might not be available, but text is still selectable
          }
        }}
        style={{
          font: "inherit",
          border: "none",
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.action.hover,
          padding: "2px 6px",
          borderRadius: "4px",
          cursor: "pointer",
          userSelect: "text",
          display: "inline-block",
        }}
      >
        {code}
      </button>
    </Tooltip>
  )
}
