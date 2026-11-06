import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useFocusOnReveal } from "../../../hooks/accessibility/useFocusOnReveal"
import { useVerifyMfa } from "../hooks/useMfaActions"
import { describeMfaError } from "../errors"

/**
 * Authenticator / recovery code entry. Verifies this session on submit
 * (POST /api/v2/auth/mfa/verify) and refreshes the profile, whose role and
 * admin_locked depend on the verification.
 */
export function MfaCodeForm(props: {
  onVerified: (info: { usedRecoveryCode: boolean; remaining?: number }) => void
  onCancel?: () => void
  submitLabel?: string
  /** Focus the code field on mount: only where the user just asked for it (a dialog). */
  focusOnOpen?: boolean
}) {
  const { t } = useTranslation()
  const focusOnReveal = useFocusOnReveal<HTMLInputElement>(
    props.focusOnOpen ?? false,
  )
  const [useRecovery, setUseRecovery] = useState(false)
  const [value, setValue] = useState("")
  const { verify, isLoading, error, reset } = useVerifyMfa()

  const valid = useRecovery
    ? value.replace(/[\s-]/g, "").length === 10
    : /^\d{6}$/.test(value)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const verified = await verify(useRecovery, value)
    if (verified) {
      props.onVerified(verified)
    } else {
      setValue("")
    }
  }

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {useRecovery
            ? t(
                "mfa.challenge.recoveryPrompt",
                "Enter one of your recovery codes. Each code works once.",
              )
            : t(
                "mfa.challenge.codePrompt",
                "Enter the 6-digit code from your authenticator app.",
              )}
        </Typography>
        <TextField
          label={
            useRecovery
              ? t("mfa.challenge.recoveryLabel", "Recovery code")
              : t("mfa.challenge.codeLabel", "Authentication code")
          }
          value={value}
          onChange={(e) => {
            reset()
            const next = e.target.value
            setValue(
              useRecovery
                ? next.toUpperCase().slice(0, 11)
                : next.replace(/\D/g, "").slice(0, 6),
            )
          }}
          inputRef={focusOnReveal}
          autoComplete="one-time-code"
          inputProps={{
            inputMode: useRecovery ? "text" : "numeric",
            pattern: useRecovery ? undefined : "[0-9]*",
            "aria-label": useRecovery
              ? t("appUi.mfa.recoveryCodeAria")
              : t("appUi.mfa.authCodeAria"),
            style: { letterSpacing: "0.3em", fontFamily: "monospace" },
          }}
          fullWidth
        />
        {error && <Alert severity="error">{describeMfaError(error, t)}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {props.onCancel && (
            <Button onClick={props.onCancel} color="inherit">
              {t("mfa.common.cancel", "Cancel")}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={!valid || isLoading}
          >
            {props.submitLabel ?? t("mfa.challenge.verify", "Verify")}
          </Button>
        </Stack>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => {
            setUseRecovery(!useRecovery)
            setValue("")
            reset()
          }}
          sx={{ alignSelf: "flex-start" }}
        >
          {useRecovery
            ? t("mfa.challenge.useCode", "Use your authenticator app instead")
            : t("mfa.challenge.useRecovery", "Use a recovery code")}
        </Link>
      </Stack>
    </Box>
  )
}
