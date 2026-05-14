import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  useProfileGetLinksQuery,
  useProfileUnlinkProviderMutation,
  useProfileSetPrimaryProviderMutation,
} from "../../profile/api/profileApi"
import { useTranslation } from "react-i18next"
import { isCitizenIdEnabled } from "../../../util/constants"

export function useAccountLinks() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: links, isLoading } = useProfileGetLinksQuery()
  const [unlinkProvider, { isLoading: isUnlinking }] = useProfileUnlinkProviderMutation()
  const [setPrimary, { isLoading: isSettingPrimary }] = useProfileSetPrimaryProviderMutation()
  const [unlinkDialog, setUnlinkDialog] = useState<{ open: boolean; providerType: string | null }>({ open: false, providerType: null })

  const errorParam = searchParams.get("error")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [accountUsername, setAccountUsername] = useState<string | null>(null)
  const [citizenIDUsername, setCitizenIDUsername] = useState<string | null>(null)

  useEffect(() => {
    if (errorParam) {
      const errorDescription = searchParams.get("error_description")
      const accountUsernameParam = searchParams.get("account_username")
      const citizenIDUsernameParam = searchParams.get("citizenid_username")
      if (accountUsernameParam) setAccountUsername(accountUsernameParam)
      if (citizenIDUsernameParam) setCitizenIDUsername(citizenIDUsernameParam)

      const newParams = new URLSearchParams(searchParams)
      newParams.delete("error"); newParams.delete("error_description")
      newParams.delete("account_username"); newParams.delete("citizenid_username")
      navigate({ search: newParams.toString() }, { replace: true })

      let message = ""
      if (isCitizenIdEnabled) {
        switch (errorParam) {
          case "citizenid_account_not_verified":
            message = t("settings.profile.accountNotVerified", "Your Citizen iD account must be verified before it can be linked. Please verify your account on Citizen iD and try again."); break
          case "citizenid_already_linked":
            message = t("settings.profile.citizenIdAlreadyLinked", "This Citizen iD account is already linked to another SC Market account ({{username}}). Please unlink it first or use a different account.", { username: citizenIDUsernameParam || "" }); break
          case "account_already_has_citizenid":
            message = t("settings.profile.accountAlreadyCitizenId", "Your SC Market account ({{username}}) already has a Citizen iD linked. Please unlink it first before linking a new one.", { username: accountUsernameParam || "" }); break
          case "discord_already_linked":
            message = t("settings.profile.discordAlreadyLinked", "This Discord account is already linked to another SC Market account ({{username}}). Please unlink it first.", { username: accountUsernameParam || "" }); break
          case "account_already_has_discord":
            message = t("settings.profile.accountAlreadyDiscord", "Your SC Market account already has Discord linked. Please unlink it first."); break
          default:
            message = t("settings.profile.linkingError", "An error occurred while linking your account: {{error}}", { error: errorDescription || errorParam }); break
        }
      } else if (errorParam.startsWith("citizenid_")) {
        message = t("settings.profile.linkingError", "An error occurred while linking your account: {{error}}", { error: errorDescription || errorParam })
      }
      setErrorMessage(message)
    }
  }, [errorParam, searchParams, navigate, t])

  const authProviders = useMemo(() => {
    if (!Array.isArray(links)) return []
    return links.filter((link) => {
      if (link.provider_type === "rsi") return false
      if (!isCitizenIdEnabled && link.provider_type === "citizenid") return false
      return true
    })
  }, [links])

  const hasDiscord = authProviders.some((link) => link.provider_type === "discord")
  const hasCitizenID = isCitizenIdEnabled && authProviders.some((link) => link.provider_type === "citizenid")
  const primaryProvider = authProviders.find((link) => link.is_primary)

  const handleUnlinkClick = useCallback((providerType: string) => {
    setUnlinkDialog({ open: true, providerType })
  }, [])

  const handleConfirmUnlink = useCallback(async () => {
    if (unlinkDialog.providerType) {
      try {
        await unlinkProvider({ provider_type: unlinkDialog.providerType })
        setUnlinkDialog({ open: false, providerType: null })
      } catch { /* RTK Query handles errors */ }
    }
  }, [unlinkDialog.providerType, unlinkProvider])

  const handleCancelUnlink = useCallback(() => {
    setUnlinkDialog({ open: false, providerType: null })
  }, [])

  const handleSetPrimary = useCallback(async (providerType: string) => {
    try { await setPrimary({ provider_type: providerType }) }
    catch { /* RTK Query handles errors */ }
  }, [setPrimary])

  const getProviderName = useCallback((providerType: string) => {
    switch (providerType) {
      case "discord": return "Discord"
      case "citizenid": return isCitizenIdEnabled ? "Citizen iD" : providerType
      case "rsi": return "RSI"
      default: return providerType
    }
  }, [])

  return {
    isLoading, isUnlinking, isSettingPrimary,
    errorMessage, setErrorMessage,
    accountUsername, setAccountUsername,
    citizenIDUsername, setCitizenIDUsername,
    authProviders, hasDiscord, hasCitizenID, primaryProvider,
    unlinkDialog, handleUnlinkClick, handleConfirmUnlink, handleCancelUnlink,
    handleSetPrimary, getProviderName,
  }
}
