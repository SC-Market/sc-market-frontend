import { useCallback } from "react"
import { useReverifyEmailMutation } from "../../../store/api/v2/market"

export type ReverifyResult =
  | { kind: "sent" }
  | { kind: "wait"; at: string }
  | { kind: "failed" }

/**
 * Send a verification email to a bounced address
 * (POST /email/deliverability/reverify). Resolves to "sent", "wait" until
 * the time the server allows another, or "failed".
 */
export function useReverifyBouncedEmail() {
  const [reverifyMutation, { isLoading: sending }] = useReverifyEmailMutation()

  const reverify = useCallback(async (): Promise<ReverifyResult> => {
    try {
      await reverifyMutation().unwrap()
      return { kind: "sent" }
    } catch (error) {
      const details = (
        error as {
          data?: { error?: { details?: { reverify_available_at?: string } } }
        }
      )?.data?.error?.details
      return details?.reverify_available_at
        ? { kind: "wait", at: details.reverify_available_at }
        : { kind: "failed" }
    }
  }, [reverifyMutation])

  return { reverify, sending }
}
