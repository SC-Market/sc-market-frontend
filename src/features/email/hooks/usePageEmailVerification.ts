import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "react-router-dom"
import { useVerifyEmailMutation } from "../api/emailApi"

export interface EmailVerificationPageData {
  status: "loading" | "success" | "error" | "invalid"
  message: string
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
        message: "Your email address has been verified successfully!",
      })
    } else if (error) {
      let errorMessage = "An error occurred during verification."
      if (error === "invalid_token") {
        errorMessage = "Invalid or expired verification token."
      } else if (error === "verification_failed") {
        errorMessage = "Email verification failed. Please try again."
      }
      setPageData({
        status: "error",
        message: errorMessage,
      })
    } else if (token && !success && !error) {
      // Trigger verification mutation when token is present
      verifyEmail(token)
        .unwrap()
        .then((result) => {
          setPageData({
            status: "success",
            message:
              result.message ||
              "Your email address has been verified successfully!",
          })
        })
        .catch((err) => {
          const errorMessage =
            err?.data?.error?.message ||
            "Verification failed. The token may be invalid or expired."
          setPageData({
            status: "error",
            message: errorMessage,
          })
        })
    } else if (!token) {
      setPageData({
        status: "invalid",
        message: "No verification token provided.",
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
    error: pageData.status === "error" ? new Error(pageData.message) : null,
    refetch,
  }
}
