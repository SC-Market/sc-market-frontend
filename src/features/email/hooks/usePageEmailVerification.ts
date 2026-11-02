import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "react-router-dom"
import { useVerifyEmailMutation } from "../api/emailApi"

export interface EmailVerificationPageData {
  status: "loading" | "success" | "error" | "invalid"
  /** Server-provided message; shown when no messageKey is set. */
  message: string
  /** i18n key for a message the app itself sets (translated where shown). */
  messageKey?: string
}

export interface UsePageEmailVerificationResult {
  data: EmailVerificationPageData | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page hook for email verification
 * Handles email verification via token from URL
 */
export function usePageEmailVerification(): UsePageEmailVerificationResult {
  const [searchParams] = useSearchParams()
  const params = useParams<{ token?: string }>()
  const [pageData, setPageData] = useState<EmailVerificationPageData>({
    status: "loading",
    message: "",
  })

  // Support both path parameter (/email/verify/:token) and query parameter (?token=...)
  const token = params.token || searchParams.get("token")
  const error = searchParams.get("error")
  const success = searchParams.get("success")

  // Use RTK Query mutation to verify email
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()

  useEffect(() => {
    // If redirected from backend with success/error params (legacy support)
    if (success === "true") {
      setPageData({
        status: "success",
        message: "",
        messageKey: "sharedUi.emailVerification.verified",
      })
    } else if (error) {
      let errorKey = "sharedUi.emailVerification.errorGeneric"
      if (error === "invalid_token") {
        errorKey = "sharedUi.emailVerification.invalidToken"
      } else if (error === "verification_failed") {
        errorKey = "sharedUi.emailVerification.failedTryAgain"
      }
      setPageData({
        status: "error",
        message: "",
        messageKey: errorKey,
      })
    } else if (token && !success && !error) {
      // Trigger verification mutation when token is present
      verifyEmail(token)
        .unwrap()
        .then((result) => {
          setPageData(
            result.message
              ? { status: "success", message: result.message }
              : {
                  status: "success",
                  message: "",
                  messageKey: "sharedUi.emailVerification.verified",
                },
          )
        })
        .catch((err) => {
          const errorMessage: string | undefined = err?.data?.error?.message
          setPageData(
            errorMessage
              ? { status: "error", message: errorMessage }
              : {
                  status: "error",
                  message: "",
                  messageKey: "sharedUi.emailVerification.failedTokenInvalid",
                },
          )
        })
    } else if (!token) {
      setPageData({
        status: "invalid",
        message: "",
        messageKey: "sharedUi.emailVerification.noToken",
      })
    }
  }, [searchParams, token, error, success, verifyEmail])

  const refetch = () => {
    if (token) {
      verifyEmail(token)
    }
  }

  return {
    data: pageData,
    isLoading: pageData.status === "loading" || isVerifying,
    isFetching: isVerifying,
    error:
      pageData.status === "error"
        ? new Error(pageData.message || pageData.messageKey)
        : null,
    refetch,
  }
}
