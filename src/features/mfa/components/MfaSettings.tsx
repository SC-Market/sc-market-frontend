import React, { useEffect, useState } from "react"
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  useGetMfaStatusQuery,
  useRegenerateMfaRecoveryCodesMutation,
  useRemoveMfaFactorMutation,
} from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"
import { useAppDispatch } from "../../../store/hooks"
import { safeRedirectPath } from "../../../util/safeRedirect"
import { describeMfaError } from "../errors"
import { MfaEnrollDialog } from "./MfaEnrollDialog"
import { RecoveryCodesPanel } from "./RecoveryCodesPanel"

const fmt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : null

/** "Two-factor authentication" settings card (site admins only for now). */
export function MfaSettings() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { data: status, isLoading } = useGetMfaStatusQuery()
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [regenerate, regenState] = useRegenerateMfaRecoveryCodesMutation()
  const [removeOpen, setRemoveOpen] = useState(false)

  // /settings?mfa=setup opens enrollment straight away (from admin pages).
  useEffect(() => {
    if (params.get("mfa") === "setup" && status && !status.enrolled) setEnrollOpen(true)
  }, [params, status])

  if (isLoading || !status) return null
  const factor = status.factors[0]

  const closeEnroll = (completed: boolean) => {
    setEnrollOpen(false)
    const redirect = params.get("redirect")
    if (completed && redirect) {
      navigate(safeRedirectPath(redirect, "/"), { replace: true })
    } else if (params.get("mfa")) {
      params.delete("mfa")
      setParams(params, { replace: true })
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">{t("mfa.settings.title", "Two-factor authentication")}</Typography>
            <Chip
              size="small"
              color={status.enrolled ? "success" : "default"}
              label={status.enrolled ? t("mfa.settings.on", "On") : t("mfa.settings.off", "Off")}
            />
          </Stack>

          {status.enforcement === "unconfigured" && (
            <Alert severity="warning">
              {t("mfa.settings.unconfigured", "Admin two-factor is switched on but the server has no encryption key (MFA_ENC_KEYS) yet, so it is not enforced and setup is unavailable.")}
            </Alert>
          )}
          {status.required && !status.enrolled && (
            <Alert severity="info">
              {t("mfa.settings.required", "Admin features need two-factor authentication. Set it up to unlock them; the rest of the site works as usual.")}
            </Alert>
          )}

          {status.enrolled && factor ? (
            <Stack spacing={0.5}>
              <Typography variant="body2">
                {factor.label} · {t("mfa.settings.added", "added {{date}}", { date: fmt(factor.created_at) })}
                {factor.last_used_at &&
                  ` · ${t("mfa.settings.lastUsed", "last used {{date}}", { date: fmt(factor.last_used_at) })}`}
              </Typography>
              <Typography variant="body2" color={status.recovery_codes_remaining <= 3 ? "warning.main" : "text.secondary"}>
                {t("mfa.settings.codesLeft", "{{count}} recovery codes left", { count: status.recovery_codes_remaining })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {status.elevated_until
                  ? t("mfa.settings.verifiedUntil", "This session is verified until {{date}}", { date: fmt(status.elevated_until) })
                  : t("mfa.settings.notVerified", "This session is not verified")}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("mfa.settings.explain", "Use an authenticator app to confirm it's you when using admin features.")}
            </Typography>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant={status.enrolled ? "outlined" : "contained"}
              onClick={() => setEnrollOpen(true)}
              disabled={status.enforcement === "unconfigured"}
            >
              {status.enrolled
                ? t("mfa.settings.replace", "Replace authenticator")
                : t("mfa.settings.setup", "Set up authenticator")}
            </Button>
            {status.enrolled && (
              <Button variant="outlined" onClick={() => regenerate()} disabled={regenState.isLoading}>
                {t("mfa.settings.regenerate", "New recovery codes")}
              </Button>
            )}
            {status.enrolled && !status.required && factor && (
              <Button color="error" onClick={() => setRemoveOpen(true)}>
                {t("mfa.settings.remove", "Turn off")}
              </Button>
            )}
          </Stack>
          {regenState.error && <Alert severity="error">{describeMfaError(regenState.error, t)}</Alert>}
        </Stack>
      </CardContent>

      <MfaEnrollDialog open={enrollOpen} onClose={closeEnroll} />

      <Dialog open={!!regenState.data} maxWidth="sm" fullWidth>
        <DialogTitle>{t("mfa.recovery.title", "Your new recovery codes")}</DialogTitle>
        <DialogContent>
          {regenState.data && (
            <RecoveryCodesPanel
              codes={regenState.data.recovery_codes}
              onDone={() => {
                regenState.reset()
                dispatch(serviceApi.util.invalidateTags(["MyProfile"]))
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {factor && (
        <RemoveFactorDialog open={removeOpen} factorId={factor.id} onClose={() => setRemoveOpen(false)} />
      )}
    </Card>
  )
}

function RemoveFactorDialog(props: { open: boolean; factorId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const [code, setCode] = useState("")
  const [remove, state] = useRemoveMfaFactorMutation()
  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("mfa.remove.title", "Turn off two-factor authentication")}</DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          component="form"
          onSubmit={async (e: React.FormEvent) => {
            e.preventDefault()
            const r = await remove({ factorId: props.factorId, mfaReauthRequest: { code } })
            if ("data" in r) props.onClose()
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("mfa.remove.explain", "Enter a current code to confirm.")}
          </Typography>
          <TextField
            label={t("mfa.challenge.codeLabel", "Authentication code")}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoComplete="one-time-code"
            inputProps={{ inputMode: "numeric" }}
          />
          {state.error && <Alert severity="error">{describeMfaError(state.error, t)}</Alert>}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button color="inherit" onClick={props.onClose}>
              {t("mfa.common.cancel", "Cancel")}
            </Button>
            <Button type="submit" color="error" variant="contained" disabled={code.length !== 6 || state.isLoading}>
              {t("mfa.remove.confirm", "Turn off")}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
