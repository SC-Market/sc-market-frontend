import { useGetUserProfileQuery } from "../../../store/profile"
import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { isCitizenIdEnabled } from "../../../util/constants"

export interface UsePageSignUpResult {
  isAuthenticated: boolean
  isLoading: boolean
  errorMessage: string | null
  clearError: () => void
}

export function usePageSignUp(): UsePageSignUpResult {
  const profile = useGetUserProfileQuery()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    if (!error) {
      setErrorMessage(null)
      return
    }

    let message: string | null = null

    // Handle specific error codes
    if (isCitizenIdEnabled && error === "citizenid_account_not_verified") {
      message =
        searchParams.get("error_description") ||
        t(
          "auth.citizenidAccountNotVerified",
          "Your Citizen iD account must be verified to sign up or log in.",
        )
    } else if (isCitizenIdEnabled && error === "citizenid_auth_failed") {
      message =
        searchParams.get("error_description") ||
        t("auth.authFailed", "Authentication failed. Please try again.")
    } else if (isCitizenIdEnabled && error === "citizenid_oauth_error") {
      message =
        searchParams.get("error_description") ||
        t(
          "auth.oauthError",
          "An error occurred during authentication. Please try again.",
        )
    } else {
      // Fallback for any unhandled errors
      const errorDescription = searchParams.get("error_description")
      if (errorDescription) {
        message = errorDescription
      } else if (error.startsWith("citizenid_")) {
        message = t(
          "auth.genericAuthError",
          "An authentication error occurred. Please try again or contact support if the problem persists.",
        )
      } else {
        message = t("auth.genericError", "An error occurred. Please try again.")
      }
    }

    if (message) {
      setErrorMessage(message)
      // Clear error from URL after displaying
      searchParams.delete("error")
      searchParams.delete("error_description")
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, t])

  return {
    isAuthenticated: !!profile.data,
    isLoading: profile.isLoading,
    errorMessage,
    clearError: () => setErrorMessage(null),
  }
}
