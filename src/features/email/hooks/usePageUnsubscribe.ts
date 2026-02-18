import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "react-router-dom"
import {
  useUnsubscribeMutation,
  useGetEmailPreferencesQuery,
} from "../api/emailApi"

export interface UnsubscribePageData {
  status: "loading" | "success" | "error" | "invalid"
  message: string
}

export interface UsePageUnsubscribeResult {
  data: UnsubscribePageData | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page hook for email unsubscribe
 * Handles email unsubscribe via token from URL
 */
export function usePageUnsubscribe(): UsePageUnsubscribeResult {
  const [searchParams] = useSearchParams()
  const params = useParams<{ token?: string }>()
  const [pageData, setPageData] = useState<UnsubscribePageData>({
    status: "loading",
    message: "",
  })

  // Support both path parameter (/email/unsubscribe/:token) and query parameter (?token=...)
  const token = params.token || searchParams.get("token")
  const error = searchParams.get("error")
  const success = searchParams.get("success")

  // Use RTK Query mutation to unsubscribe
  const [unsubscribe, { isLoading: isUnsubscribing }] = useUnsubscribeMutation()

  // Refetch preferences after unsubscribe to ensure cache is updated
  const { refetch: refetchPreferences } = useGetEmailPreferencesQuery(
    undefined,
    {
      skip: true, // Don't auto-fetch, only refetch when needed
    },
  )

  useEffect(() => {
    // If redirected from backend with success/error params (legacy support)
    if (success === "true") {
      setPageData({
        status: "success",
        message:
          "You have been successfully unsubscribed from all email notifications.",
      })
    } else if (error) {
      let errorMessage = "An error occurred during unsubscribe."
      if (error === "invalid_token") {
        errorMessage = "Invalid unsubscribe token."
      } else if (error === "already_used") {
        errorMessage = "This unsubscribe link has already been used."
      } else if (error === "unsubscribe_failed") {
        errorMessage = "Unsubscribe failed. Please try again."
      }
      setPageData({
        status: "error",
        message: errorMessage,
      })
    } else if (token && !success && !error) {
      // Trigger unsubscribe mutation when token is present
      unsubscribe(token)
        .unwrap()
        .then(async (result) => {
          // Refetch preferences to ensure cache is updated
          await refetchPreferences()
          setPageData({
            status: "success",
            message:
              result?.message ||
              "You have been successfully unsubscribed from all email notifications.",
          })
        })
        .catch((err) => {
          const errorMessage =
            err?.data?.error?.message ||
            err?.data?.message ||
            err?.error?.message ||
            err?.message ||
            (typeof err === "string"
              ? err
              : "Unsubscribe failed. The token may be invalid or already used.")
          setPageData({
            status: "error",
            message: errorMessage,
          })
        })
    } else if (!token) {
      setPageData({
        status: "invalid",
        message: "No unsubscribe token provided.",
      })
    }
  }, [searchParams, token, error, success, unsubscribe, refetchPreferences])

  const refetch = () => {
    if (token) {
      unsubscribe(token)
    }
  }

  return {
    data: pageData,
    isLoading: pageData.status === "loading" || isUnsubscribing,
    isFetching: isUnsubscribing,
    error: pageData.status === "error" ? new Error(pageData.message) : null,
    refetch,
  }
}
