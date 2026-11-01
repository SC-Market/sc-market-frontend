import React, { useState } from "react"
import { Box, Button, Typography, useTheme } from "@mui/material"
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded"
import CheckRounded from "@mui/icons-material/CheckRounded"
import { useTranslation } from "react-i18next"
import { DEFAULT_FRONTEND_URL } from "../../seo/constants"
import { ORG_PATHS } from "../../routes/paths"

export type OrgLinkBackContext = "verify" | "verified" | "manage"

/** Public SC Market org page an owner can link to from their RSI org page. */
export function orgLinkBackUrl(spectrumId: string): string {
  return `${DEFAULT_FRONTEND_URL}${ORG_PATHS.profile(spectrumId)}`
}

/**
 * Optional "Find our shop on SC Market: <url>" line an owner can keep on their
 * RSI org page. Never part of verification: only the sentinel code is checked.
 */
export function OrgLinkBackLine(props: {
  spectrumId: string
  context: OrgLinkBackContext
}) {
  const { spectrumId, context } = props
  const { t } = useTranslation()
  const theme = useTheme()
  const [copied, setCopied] = useState(false)
  const line = t("orgLinkBack.line", { url: orgLinkBackUrl(spectrumId) })
  const hint =
    context === "verify"
      ? t("orgLinkBack.verifyHint")
      : context === "verified"
        ? t("orgLinkBack.verifiedHint")
        : t("orgLinkBack.manageHint")

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(line)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable; the line stays selectable
    }
  }

  return (
    <Box
      data-testid="org-link-back"
      sx={{
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 1,
        p: 2,
      }}
    >
      {context !== "manage" && (
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("orgLinkBack.title")}
        </Typography>
      )}
      <Typography variant="body2" color="text.primary" paragraph>
        {hint}
      </Typography>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Box
          component="code"
          sx={{
            flex: 1,
            minWidth: 0,
            wordBreak: "break-all",
            userSelect: "all",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            color: "text.secondary",
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
            px: 1.5,
            py: 1,
          }}
        >
          {line}
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={copied ? <CheckRounded /> : <ContentCopyRounded />}
          onClick={copy}
          sx={{ flexShrink: 0 }}
        >
          {copied ? t("orgLinkBack.copied") : t("orgLinkBack.copy")}
        </Button>
      </Box>
    </Box>
  )
}
