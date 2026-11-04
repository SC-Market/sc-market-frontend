import type { TFunction } from "i18next"
import { formatTime, pageLocale } from "../../util/format"

interface MfaErrorBody {
  error?: {
    code?: string
    message?: string
    details?: { attempts_remaining?: number; locked_until?: string }
  }
}

/** A user-facing message for a failed two-factor request. Never echoes input. */
export function describeMfaError(error: unknown, t: TFunction): string {
  const body = (error as { data?: MfaErrorBody } | undefined)?.data?.error
  switch (body?.code) {
    case "MFA_INVALID_CODE": {
      const left = body.details?.attempts_remaining
      return left !== undefined && left <= 3
        ? t(
            "mfa.errors.invalidWithRemaining",
            "That code is not valid. {{count}} attempts left before a temporary lock.",
            { count: left },
          )
        : t("mfa.errors.invalid", "That code is not valid.")
    }
    case "MFA_LOCKED": {
      const until = body.details?.locked_until
      // Shown after a failed request (outside render): the page's language.
      const time = formatTime(until, pageLocale(), {
        hour: "2-digit",
        minute: "2-digit",
      })
      return t(
        "mfa.errors.locked",
        "Too many attempts, try again at {{time}}.",
        { time },
      )
    }
    case "MFA_SESSION_UNSUPPORTED":
      return t(
        "mfa.errors.sessionUnsupported",
        "This login session is too old for two-factor authentication. Log out and log in again.",
      )
    case "MFA_NOT_CONFIGURED":
      return t(
        "mfa.errors.notConfigured",
        "Two-factor authentication is not configured on the server yet.",
      )
    case "RATE_LIMIT_EXCEEDED":
      return t("mfa.errors.rateLimited", "Too many attempts, try again later.")
    default:
      return (
        body?.message ||
        t("mfa.errors.generic", "Something went wrong. Try again.")
      )
  }
}
