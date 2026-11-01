import React, { useEffect, useRef, useState } from "react"
import {
  CircularProgress,
  Link as MaterialLink,
  Stack,
  Typography,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"

/** How often the order/offer is re-read while the bot creates the thread. */
export const THREAD_POLL_INTERVAL_MS = 2500
/** How long to wait for the thread before giving up the pending state. */
export const THREAD_POLL_TIMEOUT_MS = 60_000

/**
 * The Discord thread cell of an order or offer: a "View thread" link once
 * the record has a thread id, otherwise a "Create thread" button.
 *
 * Creating a thread is asynchronous. The create endpoint only queues the
 * request (SQS) and answers 201 with no thread id; the Discord bot creates
 * the thread, and the backend's queue consumer (polled every 5s) writes the
 * id onto the order/offer. Nothing tells the client when that happens, so
 * after a successful create this shows a pending state and re-reads the
 * record (`refetch`) until the id lands, then the link replaces it. The
 * pending state also keeps a second click from queueing a second thread.
 */
export function DiscordThreadControl(props: {
  serverId: string
  threadId: string | null | undefined
  /** Queues the thread; resolves when the backend accepted the request. */
  create: () => Promise<unknown>
  /** Re-reads the order/offer. */
  refetch: () => unknown
}) {
  const { serverId, threadId, create, refetch } = props
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [submitting, setSubmitting] = useState(false)
  const [pending, setPending] = useState(false)
  const awaiting = pending && !threadId

  // Latest refetch/alert without restarting the poll when they change identity.
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch
  const alertRef = useRef(issueAlert)
  alertRef.current = issueAlert

  useEffect(() => {
    if (!awaiting) return
    const poll = setInterval(
      () => refetchRef.current(),
      THREAD_POLL_INTERVAL_MS,
    )
    const giveUp = setTimeout(() => {
      setPending(false)
      alertRef.current({
        message: t("discordThread.delayed"),
        severity: "info",
      })
    }, THREAD_POLL_TIMEOUT_MS)
    return () => {
      clearInterval(poll)
      clearTimeout(giveUp)
    }
  }, [awaiting, t])

  // The thread arrived: the link takes over and the pending state is done.
  useEffect(() => {
    if (threadId) setPending(false)
  }, [threadId])

  if (threadId) {
    return (
      <MaterialLink
        href={`https://discord.com/channels/${serverId}/${threadId}`}
        target="_blank"
        rel="noopener noreferrer"
        variant={"subtitle1"}
        underline={"hover"}
        color={"text.secondary"}
      >
        {t("discordThread.view")}
      </MaterialLink>
    )
  }

  if (awaiting) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" role="status">
        <CircularProgress size={14} color="inherit" />
        <Typography variant="subtitle2" color="text.secondary">
          {t("discordThread.creating")}
        </Typography>
      </Stack>
    )
  }

  return (
    <LoadingButton
      loading={submitting}
      onClick={() => {
        setSubmitting(true)
        create()
          .then(() => {
            setPending(true)
            refetchRef.current()
          })
          .catch((err) => issueAlert(err))
          .finally(() => setSubmitting(false))
      }}
    >
      {t("discordThread.create")}
    </LoadingButton>
  )
}
