import {
  Grid,
  Typography,
  Button,
  Alert,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import React, { useState, useEffect } from "react"
import {
  useProfileGetLinksQuery,
  useProfileUnlinkProviderMutation,
  useProfileSetPrimaryProviderMutation,
} from "../../store/profile"
import { useTranslation } from "react-i18next"
import { useSearchParams, useNavigate } from "react-router-dom"
import LoadingButton from "@mui/lab/LoadingButton"
import { FlatSection } from "../../components/paper/Section"
import { CitizenIDLoginButton } from "../../components/button/CitizenIDLoginButton"
import { LinkCitizenIDButton } from "../../components/button/LinkCitizenIDButton"
import { DiscordLoginButton } from "../../components/button/DiscordLoginButton"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { Discord } from "../../components/icon/DiscordIcon"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { CitizenIDLogo } from "../../components/icon/CitizenIDLogo"
import { isCitizenIdEnabled } from "../../util/constants"

export function AccountLinks() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: links, isLoading } = useProfileGetLinksQuery()
  const [unlinkProvider, { isLoading: isUnlinking }] =
    useProfileUnlinkProviderMutation()
  const [setPrimary, { isLoading: isSettingPrimary }] =
    useProfileSetPrimaryProviderMutation()
  const [unlinkDialog, setUnlinkDialog] = useState<{
    open: boolean
    providerType: string | null
  }>({ open: false, providerType: null })

  // Check for error in URL params
  const errorParam = searchParams.get("error")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [accountUsername, setAccountUsername] = useState<string | null>(null)
  const [citizenIDUsername, setCitizenIDUsername] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (errorParam) {
      // Get error description and usernames before clearing
      const errorDescription = searchParams.get("error_description")
      const accountUsernameParam = searchParams.get("account_username")
      const citizenIDUsernameParam = searchParams.get("citizenid_username")

      // Store usernames for display
      if (accountUsernameParam) {
        setAccountUsername(accountUsernameParam)
      }
      if (citizenIDUsernameParam) {
        setCitizenIDUsername(citizenIDUsernameParam)
      }

      // Clear the error from URL
      searchParams.delete("error")
      searchParams.delete("error_description")
      searchParams.delete("account_username")
      searchParams.delete("citizenid_username")
      navigate({ search: searchParams.toString() }, { replace: true })

      // Set appropriate error message based on explicit error code
      let message = ""

      // Explicit error codes from backend
      // Only show Citizen iD errors if feature is enabled
      if (isCitizenIdEnabled) {
        switch (errorParam) {
          case "citizenid_account_not_verified":
            message = t(
              "settings.profile.accountNotVerified",
              "Your Citizen iD account must be verified before it can be linked. Please verify your account on Citizen iD and try again.",
            )
            break

          case "citizenid_username_mismatch":
            // Build message with usernames if available
            if (accountUsernameParam && citizenIDUsernameParam) {
              message = t(
                "settings.profile.usernameMismatchWithUsernames",
                "Cannot link: Your account username does not match your Citizen iD username. Please use matching usernames to link accounts.",
              )
            } else if (errorDescription && errorDescription.includes('"')) {
              message = errorDescription
            } else {
              message = t(
                "settings.profile.usernameMismatch",
                "Cannot link: Your Citizen iD username does not match your account username. Please verify your account or use a matching username.",
              )
            }
            break

          case "citizenid_already_linked":
            message = t(
              "settings.profile.alreadyLinked",
              "This Citizen iD account is already linked to another user.",
            )
            break

          case "citizenid_auth_failed":
            message = t(
              "settings.profile.authFailed",
              "Authentication failed. Please try again.",
            )
            break

          case "citizenid_login_failed":
            message = t(
              "settings.profile.loginFailed",
              "Failed to log in. Please try again.",
            )
            break

          case "citizenid_oauth_error":
            message = t(
              "settings.profile.oauthError",
              "An error occurred during authentication. Please try again.",
            )
            break

          default:
            // Fallback for legacy error codes or unknown errors
            if (
              errorParam === "account_not_verified" ||
              errorParam === "Forbidden" ||
              errorParam === "forbidden" ||
              errorParam === "access_denied"
            ) {
              message = t(
                "settings.profile.accountNotVerified",
                "Your Citizen iD account must be verified before it can be linked. Please verify your account on Citizen iD and try again.",
              )
            } else if (errorParam === "auth_failed") {
              message = t(
                "settings.profile.authFailed",
                "Authentication failed. Please try again.",
              )
            } else if (
              errorParam.includes("username") ||
              errorParam.includes("match")
            ) {
              message = t(
                "settings.profile.usernameMismatch",
                "Cannot link: Your Citizen iD username does not match your account username. Please verify your account or use a matching username.",
              )
            } else if (errorParam.includes("already linked")) {
              message = t(
                "settings.profile.alreadyLinked",
                "This Citizen iD account is already linked to another user.",
              )
            } else {
              // Use error description if available, otherwise use error code
              const errorText = errorDescription || errorParam
              message = t(
                "settings.profile.linkingError",
                "An error occurred while linking your account: {{error}}",
                { error: errorText },
              )
            }
        }
      } else {
        // If Citizen iD is disabled, show generic error for Citizen iD error codes
        if (errorParam.startsWith("citizenid_")) {
          message = t(
            "settings.profile.linkingError",
            "An error occurred while linking your account: {{error}}",
            { error: errorDescription || errorParam },
          )
        }
      }
      setErrorMessage(message)
    }
  }, [
    errorParam,
    searchParams,
    navigate,
    t,
    accountUsername,
    citizenIDUsername,
  ])

  // Filter out RSI - it's not an authentication provider, only a verification method
  // Also filter out Citizen iD if feature is disabled
  const authProviders = Array.isArray(links)
    ? links.filter((link) => {
        if (link.provider_type === "rsi") return false
        if (!isCitizenIdEnabled && link.provider_type === "citizenid")
          return false
        return true
      })
    : []

  const hasDiscord = authProviders.some(
    (link) => link.provider_type === "discord",
  )
  const hasCitizenID =
    isCitizenIdEnabled &&
    authProviders.some((link) => link.provider_type === "citizenid")
  const primaryProvider = authProviders.find((link) => link.is_primary)

  const handleUnlinkClick = (providerType: string) => {
    setUnlinkDialog({ open: true, providerType })
  }

  const handleConfirmUnlink = async () => {
    if (unlinkDialog.providerType) {
      try {
        await unlinkProvider({ provider_type: unlinkDialog.providerType })
        setUnlinkDialog({ open: false, providerType: null })
      } catch (error) {
        // Error handling is done by RTK Query
      }
    }
  }

  const handleCancelUnlink = () => {
    setUnlinkDialog({ open: false, providerType: null })
  }

  const handleSetPrimary = async (providerType: string) => {
    try {
      await setPrimary({ provider_type: providerType })
    } catch (error) {
      // Error handling is done by RTK Query
    }
  }

  const getProviderName = (providerType: string) => {
    switch (providerType) {
      case "discord":
        return "Discord"
      case "citizenid":
        if (!isCitizenIdEnabled) return providerType // Fallback if somehow shown when disabled
        return "Citizen iD"
      case "rsi":
        return "RSI"
      default:
        return providerType
    }
  }

  const getProviderIcon = (providerType: string) => {
    switch (providerType) {
      case "discord":
        return <Discord />
      case "citizenid":
        if (!isCitizenIdEnabled) return <AccountCircleIcon />
        return <CitizenIDLogo height={24} />
      default:
        return <AccountCircleIcon />
    }
  }

  return (
    <>
      <FlatSection
        title={t("settings.profile.accountLinks", "Linked Accounts")}
      >
        {errorMessage && (
          <Grid item xs={12}>
            <Alert
              severity="error"
              onClose={() => {
                setErrorMessage(null)
                setAccountUsername(null)
                setCitizenIDUsername(null)
              }}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" component="div">
                {errorMessage}
              </Typography>
              {accountUsername && citizenIDUsername && (
                <Box
                  sx={{
                    mt: 2,
                    pl: 2,
                    borderLeft: 2,
                    borderColor: "error.main",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: "medium" }}
                  >
                    {t("settings.profile.usernames", "Usernames:")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>
                      {t(
                        "settings.profile.accountUsername",
                        "Account username",
                      )}
                      :
                    </strong>{" "}
                    <code
                      style={{
                        backgroundColor: "rgba(0,0,0,0.05)",
                        padding: "2px 4px",
                        borderRadius: "3px",
                      }}
                    >
                      {accountUsername}
                    </code>
                  </Typography>
                  <Typography variant="body2">
                    <strong>
                      {t(
                        "settings.profile.citizenIDUsername",
                        "Citizen iD username",
                      )}
                      :
                    </strong>{" "}
                    <code
                      style={{
                        backgroundColor: "rgba(0,0,0,0.05)",
                        padding: "2px 4px",
                        borderRadius: "3px",
                      }}
                    >
                      {citizenIDUsername}
                    </code>
                  </Typography>
                </Box>
              )}
            </Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t(
              "settings.profile.accountLinksDescription",
              "Manage your linked authentication accounts. You can link multiple accounts and choose which one to use for login.",
            )}
          </Typography>
        </Grid>

        {isLoading ? (
          <Grid item xs={12}>
            <Typography>Loading...</Typography>
          </Grid>
        ) : (
          <>
            {authProviders.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {authProviders.map((link) => (
                    <Box
                      key={link.provider_type}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 2,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {getProviderIcon(link.provider_type)}
                        <Typography variant="body1">
                          {getProviderName(link.provider_type)}
                        </Typography>
                        {link.is_primary && (
                          <Chip
                            label={t("settings.profile.primary", "Primary")}
                            color="primary"
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {!link.is_primary && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleSetPrimary(link.provider_type)}
                            disabled={isSettingPrimary}
                          >
                            {t("settings.profile.setPrimary", "Set as Primary")}
                          </Button>
                        )}
                        {authProviders.length > 1 && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() =>
                              handleUnlinkClick(link.provider_type)
                            }
                            disabled={isUnlinking}
                          >
                            {t("settings.profile.unlink", "Unlink")}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {t("settings.profile.linkNewAccount", "Link New Account")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {!hasDiscord && <DiscordLoginButton />}
                {isCitizenIdEnabled && !hasCitizenID && <LinkCitizenIDButton />}
                {hasDiscord && (!isCitizenIdEnabled || hasCitizenID) && (
                  <Typography variant="body2" color="text.secondary">
                    {t(
                      "settings.profile.allAccountsLinked",
                      "All available accounts are linked.",
                    )}
                  </Typography>
                )}
              </Box>
            </Grid>
          </>
        )}
      </FlatSection>

      <Dialog
        open={unlinkDialog.open}
        onClose={handleCancelUnlink}
        aria-labelledby="unlink-dialog-title"
        aria-describedby="unlink-dialog-description"
      >
        <DialogTitle id="unlink-dialog-title">
          {t("settings.profile.unlinkProviderTitle", "Unlink Account")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="unlink-dialog-description">
            {t(
              "settings.profile.unlinkProviderDescription",
              "Are you sure you want to unlink this account? You will no longer be able to log in using this method.",
              {
                provider: unlinkDialog.providerType
                  ? getProviderName(unlinkDialog.providerType)
                  : "",
              },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUnlink}>
            {t("common.cancel", "Cancel")}
          </Button>
          <LoadingButton
            onClick={handleConfirmUnlink}
            color="error"
            loading={isUnlinking}
            variant="contained"
          >
            {t("settings.profile.unlink", "Unlink")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
