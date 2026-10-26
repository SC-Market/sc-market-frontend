import React, { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@mui/material"
import { useTranslation } from "react-i18next"
import { setMfaChallengeHandler, type MfaChallengeKind } from "../challengeBroker"
import { MfaCodeForm } from "./MfaCodeForm"

/**
 * Answers MFA challenges raised by the base query (see challengeBroker):
 * a modal asking for a code, then the original request is retried once.
 * Mounted once at the app root; idle for everyone who never gets an MFA 403.
 */
export function MfaChallengeDialogHost() {
  const { t } = useTranslation()
  const [kind, setKind] = useState<MfaChallengeKind | null>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)

  useEffect(
    () =>
      setMfaChallengeHandler(
        (next) =>
          new Promise<boolean>((resolve) => {
            resolver.current = resolve
            setKind(next)
          }),
      ),
    [],
  )

  const finish = (ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setKind(null)
  }

  return (
    <Dialog open={kind !== null} onClose={() => finish(false)} maxWidth="xs" fullWidth>
      <DialogTitle>
        {kind === "step_up"
          ? t("mfa.stepUp.title", "Confirm it's you")
          : t("mfa.challenge.title", "Two-factor verification")}
      </DialogTitle>
      <DialogContent>
        {kind !== null && (
          <MfaCodeForm
            onVerified={() => finish(true)}
            onCancel={() => finish(false)}
            submitLabel={
              kind === "step_up"
                ? t("mfa.stepUp.confirm", "Confirm")
                : undefined
            }
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
