import React, { useEffect, useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useConfirmTotpEnrollmentMutation,
  useStartTotpEnrollmentMutation,
} from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"
import { useAppDispatch } from "../../../store/hooks"
import { describeMfaError } from "../errors"
import { RecoveryCodesPanel } from "./RecoveryCodesPanel"

/**
 * Authenticator enrollment: QR + manual key, first code, recovery codes.
 * Replacing an existing authenticator needs a step-up, which the base query
 * prompts for automatically.
 */
export function MfaEnrollDialog(props: { open: boolean; onClose: (completed: boolean) => void }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [step, setStep] = useState(0)
  const [code, setCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [start, startState] = useStartTotpEnrollmentMutation()
  const [confirm, confirmState] = useConfirmTotpEnrollmentMutation()
  const enrollment = startState.data
  const recoveryCodes = confirmState.data?.recovery_codes

  useEffect(() => {
    if (!props.open) {
      // Drop the secret and recovery codes from the store once closed.
      startState.reset()
      confirmState.reset()
      return
    }
    if (props.open) {
      setStep(0)
      setCode("")
      setCopied(false)
      startState.reset()
      confirmState.reset()
      start({ totpEnrollRequest: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open])

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollment || !/^\d{6}$/.test(code)) return
    const result = await confirm({ totpConfirmRequest: { factor_id: enrollment.factor_id, code } })
    if ("data" in result && result.data) {
      dispatch(serviceApi.util.invalidateTags(["MyProfile"]))
      setStep(2)
    } else {
      setCode("")
    }
  }

  const steps = [
    t("mfa.enroll.stepScan", "Scan"),
    t("mfa.enroll.stepConfirm", "Confirm"),
    t("mfa.enroll.stepSave", "Save recovery codes"),
  ]

  return (
    <Dialog
      open={props.open}
      onClose={() => step !== 2 && props.onClose(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("mfa.enroll.title", "Set up two-factor authentication")}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Stack spacing={2} alignItems="center">
            {startState.isLoading && <CircularProgress />}
            {startState.error && (
              <Alert severity="error" sx={{ alignSelf: "stretch" }}>
                {describeMfaError(startState.error, t)}
              </Alert>
            )}
            {enrollment && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {t("mfa.enroll.scan", "Scan this QR code with an authenticator app (1Password, Bitwarden, Google Authenticator, Authy, ...).")}
                </Typography>
                <Box
                  component="img"
                  src={enrollment.qr_data_url}
                  alt={t("mfa.enroll.qrAlt", "QR code for your authenticator app")}
                  sx={{ width: 220, height: 220, bgcolor: "white", p: 1, borderRadius: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("mfa.enroll.manual", "Or enter this key manually:")}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    component="code"
                    data-testid="mfa-manual-key"
                    sx={{ fontFamily: "monospace", fontSize: "1.05rem", letterSpacing: "0.05em" }}
                  >
                    {enrollment.manual_key}
                  </Typography>
                  <Button
                    size="small"
                    onClick={async () => {
                      await navigator.clipboard.writeText(enrollment.manual_key.replace(/ /g, ""))
                      setCopied(true)
                    }}
                  >
                    {copied ? t("mfa.common.copied", "Copied") : t("mfa.common.copy", "Copy")}
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignSelf: "flex-end" }}>
                  <Button color="inherit" onClick={() => props.onClose(false)}>
                    {t("mfa.common.cancel", "Cancel")}
                  </Button>
                  <Button variant="contained" onClick={() => setStep(1)}>
                    {t("mfa.common.next", "Next")}
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        )}

        {step === 1 && (
          <Box component="form" onSubmit={submitCode} noValidate>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {t("mfa.enroll.confirm", "Enter the 6-digit code your app shows now.")}
              </Typography>
              <TextField
                label={t("mfa.challenge.codeLabel", "Authentication code")}
                value={code}
                onChange={(e) => {
                  confirmState.reset()
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }}
                autoFocus
                autoComplete="one-time-code"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  "aria-label": "authentication code",
                  style: { letterSpacing: "0.3em", fontFamily: "monospace" },
                }}
              />
              {confirmState.error && (
                <Alert severity="error">{describeMfaError(confirmState.error, t)}</Alert>
              )}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button color="inherit" onClick={() => setStep(0)}>
                  {t("mfa.common.back", "Back")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!/^\d{6}$/.test(code) || confirmState.isLoading}
                >
                  {t("mfa.enroll.activate", "Turn on")}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {step === 2 && recoveryCodes && (
          <RecoveryCodesPanel codes={recoveryCodes} onDone={() => props.onClose(true)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
