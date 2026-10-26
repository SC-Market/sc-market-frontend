/**
 * Bridges API errors to the two-factor prompt.
 *
 * The backend answers 403 with error.code MFA_REQUIRED (admin session not
 * verified) or MFA_STEP_UP_REQUIRED (sensitive action, verify again). The
 * base query asks the broker for a challenge; the dialog host mounted at the
 * app root shows it and resolves true once the session is verified, and the
 * request is retried once. With no host mounted the error is returned as is.
 */

export type MfaChallengeKind = "required" | "step_up"

export const MFA_CHALLENGE_CODES: Record<string, MfaChallengeKind> = {
  MFA_REQUIRED: "required",
  MFA_STEP_UP_REQUIRED: "step_up",
}

type Handler = (kind: MfaChallengeKind) => Promise<boolean>

let handler: Handler | null = null
let pending: Promise<boolean> | null = null

/** Register the UI that answers challenges. Returns an unregister function. */
export function setMfaChallengeHandler(next: Handler): () => void {
  handler = next
  return () => {
    if (handler === next) handler = null
  }
}

/**
 * Ask the user to verify. Concurrent requests share one prompt. Resolves
 * false when there is no UI or the user cancels.
 */
export function requestMfaChallenge(kind: MfaChallengeKind): Promise<boolean> {
  if (!handler) return Promise.resolve(false)
  if (!pending) {
    pending = handler(kind).finally(() => {
      pending = null
    })
  }
  return pending
}

/** The MFA error code in an RTK Query error body, if any. */
export function mfaErrorCode(error: unknown): string | undefined {
  const data = (error as { data?: { error?: { code?: unknown } } } | undefined)?.data
  const code = data?.error?.code
  return typeof code === "string" && code.startsWith("MFA_") ? code : undefined
}

/** Requests to the two-factor endpoints themselves never trigger a prompt. */
export function isMfaEndpoint(args: string | { url: string }): boolean {
  const url = typeof args === "string" ? args : args.url
  return /(^|\/)auth\/mfa\//.test(url)
}
