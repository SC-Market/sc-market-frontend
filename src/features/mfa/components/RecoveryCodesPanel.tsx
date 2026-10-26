import React, { useState } from "react"
import { Alert, Box, Button, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

/** Shows freshly issued recovery codes once, with copy / download. */
export function RecoveryCodesPanel(props: { codes: string[]; onDone: () => void }) {
  const { t } = useTranslation()
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const text = props.codes.join("\n")

  const download = () => {
    const blob = new Blob(
      [`SC Market recovery codes (each works once)\n\n${text}\n`],
      { type: "text/plain" },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sc-market-recovery-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Stack spacing={2}>
      <Alert severity="warning">
        {t("mfa.recovery.warning", "Save these recovery codes now. They are shown only once. Each one lets you in once if you lose your authenticator.")}
      </Alert>
      <Box
        component="ul"
        aria-label="recovery codes"
        sx={{
          m: 0,
          p: 2,
          listStyle: "none",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 1,
          fontFamily: "monospace",
          bgcolor: "action.hover",
          borderRadius: 1,
        }}
      >
        {props.codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </Box>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          onClick={async () => {
            await navigator.clipboard.writeText(text)
            setCopied(true)
          }}
        >
          {copied ? t("mfa.common.copied", "Copied") : t("mfa.common.copy", "Copy")}
        </Button>
        <Button variant="outlined" onClick={download}>
          {t("mfa.recovery.download", "Download .txt")}
        </Button>
      </Stack>
      <FormControlLabel
        control={<Checkbox checked={saved} onChange={(e) => setSaved(e.target.checked)} />}
        label={<Typography variant="body2">{t("mfa.recovery.saved", "I saved these codes")}</Typography>}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" disabled={!saved} onClick={props.onDone}>
          {t("mfa.common.done", "Done")}
        </Button>
      </Box>
    </Stack>
  )
}
