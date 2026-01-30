import { useCallback, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  useAddEmailMutation,
  useUpdateEmailMutation,
  useDeleteEmailMutation,
  useRequestVerificationMutation,
} from "../api/emailApi"

export function useEmailActions() {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState<number>(0)

  const [addEmail] = useAddEmailMutation()
  const [updateEmail] = useUpdateEmailMutation()
  const [deleteEmail] = useDeleteEmailMutation()
  const [requestVerification] = useRequestVerificationMutation()

  // Handle add email
  const handleAddEmail = useCallback(
    async (email: string, notificationTypeIds: number[]) => {
      if (!email || !email.includes("@")) {
        setError(t("settings.email.invalidEmail"))
        return { success: false }
      }

      setError(null)
      setSuccess(null)

      try {
        const result = await addEmail({
          email,
          notificationTypeIds,
        }).unwrap()

        setSuccess(result.message || t("settings.email.addSuccess"))
        return { success: true, result }
      } catch (error: any) {
        setError(
          error?.data?.error?.message ||
            error?.message ||
            t("settings.email.addError"),
        )
        return { success: false, error }
      }
    },
    [addEmail, t],
  )

  // Handle update email
  const handleUpdateEmail = useCallback(
    async (email: string) => {
      if (!email || !email.includes("@")) {
        setError(t("settings.email.invalidEmail"))
        return { success: false }
      }

      setError(null)
      setSuccess(null)

      try {
        const result = await updateEmail({ email }).unwrap()
        setSuccess(result.message || t("settings.email.updateSuccess"))
        return { success: true, result }
      } catch (error: any) {
        setError(
          error?.data?.error?.message ||
            error?.message ||
            t("settings.email.updateError"),
        )
        return { success: false, error }
      }
    },
    [updateEmail, t],
  )

  // Handle delete email
  const handleDeleteEmail = useCallback(async () => {
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteEmail().unwrap()
      setSuccess(result.message || t("settings.email.deleteSuccess"))
      return { success: true, result }
    } catch (error: any) {
      setError(
        error?.data?.error?.message ||
          error?.message ||
          t("settings.email.deleteError"),
      )
      return { success: false, error }
    }
  }, [deleteEmail, t])

  // Handle request verification with cooldown
  const handleRequestVerification = useCallback(async () => {
    if (resendCooldown > 0) {
      return { success: false } // Still in cooldown
    }

    setError(null)
    setSuccess(null)

    // Set cooldown to 60 seconds
    setResendCooldown(60)

    try {
      const result = await requestVerification().unwrap()
      setSuccess(result.message || t("settings.email.verificationSent"))
      return { success: true, result }
    } catch (error: any) {
      setError(
        error?.data?.error?.message ||
          error?.message ||
            t("settings.email.verificationError"),
      )
      // Reset cooldown on error so user can retry
      setResendCooldown(0)
      return { success: false, error }
    }
  }, [requestVerification, resendCooldown, t])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return {
    handleAddEmail,
    handleUpdateEmail,
    handleDeleteEmail,
    handleRequestVerification,
    resendCooldown,
    error,
    success,
    setError,
    setSuccess,
  }
}
