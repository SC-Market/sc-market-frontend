import React, { useEffect, useRef, useState } from "react"
import { Alert, AlertTitle, Box, Button } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetEmailDeliverabilityQuery,
  useReverifyEmailMutation,
  type EmailBounceKind,
} from "../../../store/api/v2/market"
import { useFormatters } from "../../../util/format"

interface EmailBounceNoticeProps {
  /** The address shown in Settings › Email; a change refetches the status. */
  email: string | null
  onEditEmail: () => void
}

/**
 * Settings › Email: "Your email bounced" when SES reported a hard bounce,
 * repeated soft bounces or a spam complaint for the user's address
 * (GET /email/deliverability). SC Market sends nothing to it until the user
 * re-verifies it (POST /email/deliverability/reverify; following the link
 * clears the bounce) or changes it.
 */
export function EmailBounceNotice({ email, onEditEmail }: EmailBounceNoticeProps) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { data, refetch } = useGetEmailDeliverabilityQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [reverify, { isLoading: sending }] = useReverifyEmailMutation()
  const [result, setResult] = useState<
    { kind: "sent" } | { kind: "wait"; at: string } | { kind: "failed" } | null
  >(null)

  // Changing (or removing) the address resets its bounce on the server.
  const shownEmail = useRef(email)
  useEffect(() => {
    if (shownEmail.current === email) return
    shownEmail.current = email
    setResult(null)
    refetch()
  }, [email, refetch])

  if (!data?.undeliverable || !email) return null

  const formatDate = (iso: string | null) => fmt.date(iso)
  const formatTime = (iso: string) =>
    fmt.time(iso, { hour: "2-digit", minute: "2-digit" })

  const values = { email, date: formatDate(data.bounced_at) }
  const reasons: Record<EmailBounceKind, string> = {
    hard: t("settings.email.bounce.hard", values),
    soft: t("settings.email.bounce.soft", values),
    complaint: t("settings.email.bounce.complaint", values),
  }
  const waitIso =
    result?.kind === "wait" ? result.at : data.reverify_available_at
  // The server refuses another verification email until then.
  const waitUntil =
    waitIso && new Date(waitIso).getTime() > Date.now() ? waitIso : null

  const onReverify = async () => {
    try {
      await reverify().unwrap()
      setResult({ kind: "sent" })
    } catch (error) {
      const details = (
        error as {
          data?: { error?: { details?: { reverify_available_at?: string } } }
        }
      )?.data?.error?.details
      setResult(
        details?.reverify_available_at
          ? { kind: "wait", at: details.reverify_available_at }
          : { kind: "failed" },
      )
    }
  }

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      data-testid="email-bounce-notice"
    >
      <AlertTitle>{t("settings.email.bounce.title")}</AlertTitle>
      {data.bounce_type && reasons[data.bounce_type]}
      {result?.kind === "sent" && (
        <Box sx={{ mt: 1 }}>{t("settings.email.bounce.reverifySent")}</Box>
      )}
      {result?.kind === "failed" && (
        <Box sx={{ mt: 1 }}>{t("settings.email.bounce.reverifyFailed")}</Box>
      )}
      {result?.kind !== "sent" && waitUntil && (
        <Box sx={{ mt: 1 }}>
          {t("settings.email.bounce.reverifyWait", {
            time: formatTime(waitUntil),
          })}
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          size="small"
          color="warning"
          onClick={onEditEmail}
        >
          {t("settings.email.bounce.update")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          onClick={onReverify}
          disabled={sending || result?.kind === "sent" || !!waitUntil}
        >
          {t("settings.email.bounce.reverify")}
        </Button>
      </Box>
    </Alert>
  )
}
