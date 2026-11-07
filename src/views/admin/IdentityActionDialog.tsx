import { useState } from "react"
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  type IdentityActionKind,
  type IdentityDetail,
} from "../../store/api/v2/market"
import { describeMfaError } from "../../features/mfa/errors"
import {
  useIdentityAction,
  type IdentityActionId,
} from "../../features/admin/hooks/useIdentityAction"
import { REASON_MIN, REASON_MAX } from "./identityShared"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"

export const SPECTRUM_ID_RE = /^[0-9]{1,20}$/

export type ActionId = IdentityActionId

export function ActionDialog(props: {
  action: ActionId | null
  user: IdentityDetail
  onClose: () => void
  onDone: (kind: IdentityActionKind) => void
}) {
  const { action, user, onClose, onDone } = props
  const { t } = useTranslation()
  const [reason, setReason] = useState("")
  const [allowNoLogin, setAllowNoLogin] = useState(false)
  const [spectrumMode, setSpectrumMode] = useState<"clear" | "set">("clear")
  const [spectrumId, setSpectrumId] = useState("")
  const identityAction = useIdentityAction(action)
  const trimmed = reason.trim()
  const reasonOk = trimmed.length >= REASON_MIN && trimmed.length <= REASON_MAX
  const spectrumOk =
    action !== "spectrum" ||
    spectrumMode === "clear" ||
    SPECTRUM_ID_RE.test(spectrumId.trim())
  const discordOnlyLogin =
    user.providers.some((p) => p.provider_type === "discord") &&
    !user.providers.some((p) => p.provider_type === "citizenid")
  const canSubmit =
    reasonOk &&
    spectrumOk &&
    !identityAction.isLoading &&
    (action !== "unlinkDiscord" || !discordOnlyLogin || allowNoLogin)

  const close = () => {
    setReason("")
    setAllowNoLogin(false)
    setSpectrumMode("clear")
    setSpectrumId("")
    identityAction.reset()
    onClose()
  }

  const submit = async () => {
    if (!action || !canSubmit) return
    const kind = await identityAction.run(user.user_id, {
      reason: trimmed,
      allowNoLogin,
      spectrum:
        spectrumMode === "set"
          ? { mode: "set", spectrumUserId: spectrumId.trim() }
          : { mode: "clear" },
    })
    if (kind) {
      onDone(kind)
      close()
    }
  }

  const titles: Record<ActionId, string> = {
    release: t("adminIdentity.actions.releaseUsername", "Release username"),
    unlinkDiscord: t("adminIdentity.actions.unlinkDiscord", "Unlink Discord"),
    spectrum: t("adminIdentity.actions.fixSpectrum", "Fix Spectrum link"),
    deactivate: t("adminIdentity.actions.deactivate", "Deactivate account"),
    reactivate: t("adminIdentity.actions.reactivate", "Reactivate account"),
  }
  const bodies: Record<ActionId, string> = {
    release: t(
      "adminIdentity.dialog.releaseBody",
      "Renames {{username}} to a placeholder (user_xxxxxxxx) so the handle is free. Nothing else on the account changes. The user is notified and can get their own current RSI handle back with Sync handle.",
      { username: user.username },
    ),
    unlinkDiscord: t(
      "adminIdentity.dialog.unlinkBody",
      "Removes the Discord link and the legacy Discord id from this account so that Discord account can be used elsewhere. It is not moved to any other account.",
    ),
    spectrum: t(
      "adminIdentity.dialog.spectrumBody",
      "Clear removes the Spectrum id and the RSI verification. Set writes a Spectrum id that no other account holds; an id held elsewhere is never moved.",
    ),
    deactivate: t(
      "adminIdentity.dialog.deactivateBody",
      "The account can no longer log in or use API tokens, and its sessions end now.",
    ),
    reactivate: t(
      "adminIdentity.dialog.reactivateBody",
      "The account can log in again.",
    ),
  }

  return (
    <ResponsiveDialog
      open={action !== null}
      onClose={close}
      maxWidth="sm"
      title={action ? titles[action] : undefined}
      actions={
        action && (
          <>
            <Button color="inherit" onClick={close}>
              {t("adminIdentity.dialog.cancel", "Cancel")}
            </Button>
            <Button
              variant="contained"
              color={action === "deactivate" ? "error" : "primary"}
              disabled={!canSubmit}
              onClick={submit}
              data-testid="identity-confirm"
            >
              {titles[action]}
            </Button>
          </>
        )
      }
    >
      {action && (
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {bodies[action]}
          </Typography>
          {action === "unlinkDiscord" && discordOnlyLogin && (
            <Alert severity="warning">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allowNoLogin}
                    onChange={(e) => setAllowNoLogin(e.target.checked)}
                    inputProps={{
                      "aria-label": t(
                        "adminIdentity.dialog.allowNoLogin",
                        "Discord is the only login method. Leave the account without one.",
                      ),
                    }}
                  />
                }
                label={t(
                  "adminIdentity.dialog.allowNoLogin",
                  "Discord is the only login method. Leave the account without one.",
                )}
              />
            </Alert>
          )}
          {action === "spectrum" && (
            <>
              <RadioGroup
                row
                value={spectrumMode}
                onChange={(e) =>
                  setSpectrumMode(e.target.value === "set" ? "set" : "clear")
                }
              >
                <FormControlLabel
                  value="clear"
                  control={<Radio />}
                  label={t("adminIdentity.dialog.spectrumClear", "Clear")}
                />
                <FormControlLabel
                  value="set"
                  control={<Radio />}
                  label={t("adminIdentity.dialog.spectrumSet", "Set")}
                />
              </RadioGroup>
              {spectrumMode === "set" && (
                <TextField
                  label={t(
                    "adminIdentity.dialog.spectrumId",
                    "Spectrum id (digits)",
                  )}
                  value={spectrumId}
                  onChange={(e) => setSpectrumId(e.target.value)}
                  error={
                    spectrumId !== "" && !SPECTRUM_ID_RE.test(spectrumId.trim())
                  }
                  inputProps={{
                    "data-testid": "identity-spectrum-id",
                    inputMode: "numeric",
                    autoComplete: "off",
                  }}
                />
              )}
            </>
          )}
          <TextField
            label={t("adminIdentity.dialog.reason", "Reason")}
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
            multiline
            minRows={2}
            required
            helperText={t(
              "adminIdentity.dialog.reasonHelp",
              "Required, {{min}} to {{max}} characters. Kept in the audit log; the user never sees it.",
              { min: REASON_MIN, max: REASON_MAX },
            )}
            inputProps={{ "data-testid": "identity-reason" }}
          />
          <Typography variant="caption" color="text.primary">
            {t(
              "adminIdentity.dialog.stepUpNote",
              "You will be asked for a two-factor code if you haven't entered one in the last 10 minutes.",
            )}
          </Typography>
          {identityAction.error && (
            <Alert severity="error">
              {describeMfaError(identityAction.error, t)}
            </Alert>
          )}
        </Stack>
      )}
    </ResponsiveDialog>
  )
}
