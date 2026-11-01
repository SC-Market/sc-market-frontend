import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { usePostApiEmailUnsubscribeByTokenMutation } from "../../../store/api/email"

export interface UnsubscribePageData {
  status: "loading" | "success" | "error" | "invalid"
  message: string
  /** What was turned off ("order updates", "all notification emails"). */
  label?: string
  /** True once everything that can be turned off is off. */
  all?: boolean
}

export interface UsePageUnsubscribeResult {
  data: UnsubscribePageData
  isLoading: boolean
  /** Turn off every notification email (same link, no login). */
  unsubscribeAll: () => void
  isUnsubscribingAll: boolean
}

function errorMessage(err: unknown): string {
  const e = err as
    | { data?: { error?: { message?: string }; message?: string } }
    | undefined
  return (
    e?.data?.error?.message ||
    e?.data?.message ||
    "This unsubscribe link is not valid. You can change your emails in Settings."
  )
}

/**
 * Email unsubscribe page: opening the link unsubscribes at once, with no
 * login (the signed token in the link is the credential). The backend turns
 * off the email category the link was sent for; "turn off all" uses the
 * same link.
 */
export function usePageUnsubscribe(): UsePageUnsubscribeResult {
  const params = useParams<{ token?: string }>()
  const [searchParams] = useSearchParams()
  const token = params.token || searchParams.get("token") || ""
  const [unsubscribe] = usePostApiEmailUnsubscribeByTokenMutation()
  const [unsubscribeAllMutation, { isLoading: isUnsubscribingAll }] =
    usePostApiEmailUnsubscribeByTokenMutation()
  const [data, setData] = useState<UnsubscribePageData>(
    token
      ? { status: "loading", message: "" }
      : { status: "invalid", message: "No unsubscribe link was given." },
  )
  const started = useRef<string | null>(null)

  useEffect(() => {
    if (!token || started.current === token) return
    started.current = token
    unsubscribe({ token })
      .unwrap()
      .then((res) =>
        setData({
          status: "success",
          message: res.data.message,
          label: res.data.label,
          all: res.data.scope === "all",
        }),
      )
      .catch((err) => setData({ status: "error", message: errorMessage(err) }))
  }, [token, unsubscribe])

  const unsubscribeAll = useCallback(() => {
    if (!token) return
    unsubscribeAllMutation({ token, all: "true" })
      .unwrap()
      .then((res) =>
        setData({
          status: "success",
          message: res.data.message,
          label: res.data.label,
          all: true,
        }),
      )
      .catch((err) => setData({ status: "error", message: errorMessage(err) }))
  }, [token, unsubscribeAllMutation])

  return {
    data,
    isLoading: data.status === "loading",
    unsubscribeAll,
    isUnsubscribingAll,
  }
}
