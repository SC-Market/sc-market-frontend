import React, { useState } from "react"
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded"
import { useTranslation } from "react-i18next"
import { FRONTEND_URL } from "../../../util/constants"

type Widget = "card" | "listings"

const SIZES: Record<Widget, { width: number; height: number }> = {
  card: { width: 420, height: 300 },
  listings: { width: 640, height: 560 },
}

/** The iframe snippet of a widget (read-only, see pages/embed/EmbedOrg.tsx). */
export function embedSnippet(spectrumId: string, widget: Widget, name: string): string {
  const path = `/embed/org/${encodeURIComponent(spectrumId)}${widget === "listings" ? "/listings" : ""}`
  const { width, height } = SIZES[widget]
  const title = name.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
  return `<iframe src="${FRONTEND_URL}${path}" title="${title} on SC Market" width="${width}" height="${height}" style="border:0;border-radius:8px;max-width:100%" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
}

/**
 * Org settings › Storefront: "Get embed code" for the read-only widgets an
 * org can put on its own site (its storefront card or its listings).
 */
export function EmbedCodeCard(props: { spectrumId: string; name: string }) {
  const { t } = useTranslation()
  const [widget, setWidget] = useState<Widget>("card")
  const [copied, setCopied] = useState(false)
  const snippet = embedSnippet(props.spectrumId, widget, props.name)

  return (
    <Paper sx={{ p: 2 }} data-testid="embed-code">
      <Typography variant="h6" component="h2" color="text.secondary">
        {t("storefront.embedCode.title", "Get embed code")}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
        {t(
          "storefront.embedCode.intro",
          "Put your storefront on your own website. The widget is read-only: it shows your public listings and stats, and every link opens SC Market in a new tab.",
        )}
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={widget}
        onChange={(_e, value: Widget | null) => {
          if (value) {
            setWidget(value)
            setCopied(false)
          }
        }}
        sx={{ mt: 1.5 }}
        aria-label={t("storefront.embedCode.widget", "Widget")}
      >
        <ToggleButton value="card">{t("storefront.embedCode.card", "Storefront card")}</ToggleButton>
        <ToggleButton value="listings">{t("storefront.embedCode.listings", "Listings")}</ToggleButton>
      </ToggleButtonGroup>
      <TextField
        value={snippet}
        multiline
        fullWidth
        minRows={3}
        sx={{ mt: 1.5 }}
        label={t("storefront.embedCode.snippet", "HTML")}
        InputProps={{ readOnly: true, sx: { fontFamily: "monospace", fontSize: 13 } }}
        onFocus={(e) => e.target.select()}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentCopyRounded />}
          onClick={() => {
            void navigator.clipboard?.writeText(snippet).then(() => setCopied(true))
          }}
        >
          {copied ? t("storefront.embedCode.copied", "Copied") : t("storefront.embedCode.copy", "Copy code")}
        </Button>
      </Stack>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
        {t("storefront.embedCode.preview", "Preview")}
      </Typography>
      <Box sx={{ mt: 1, overflowX: "auto" }}>
        <Box
          component="iframe"
          key={widget}
          src={`/embed/org/${encodeURIComponent(props.spectrumId)}${widget === "listings" ? "/listings" : ""}`}
          title={t("storefront.embedCode.preview", "Preview")}
          loading="lazy"
          sx={{ border: 0, borderRadius: 1, width: SIZES[widget].width, height: SIZES[widget].height, maxWidth: "100%" }}
        />
      </Box>
    </Paper>
  )
}
