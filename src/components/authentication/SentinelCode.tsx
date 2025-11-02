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
      <span
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
          } catch (err) {
            // Clipboard API might not be available, but text is still selectable
          }
        }}
        style={{
          color: theme.palette.primary.main,
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          padding: "2px 6px",
          borderRadius: "4px",
          cursor: "pointer",
          userSelect: "text",
          display: "inline-block",
        }}
      >
        {code}
      </span>
    </Tooltip>
  )
}
