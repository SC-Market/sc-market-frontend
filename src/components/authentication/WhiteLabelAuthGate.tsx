import React from "react"
import { Box, Typography, Button, CircularProgress } from "@mui/material"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { IS_CUSTOM_DOMAIN, getWhiteLabelConfig } from "../../hooks/contractor/CustomDomain"
import { BACKEND_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"

/**
 * Auth gate for internal-mode white-label domains.
 * - If focus_mode is "public", renders children immediately.
 * - If focus_mode is "internal", requires login.
 * - If require_membership is true, also checks org membership.
 */
export function WhiteLabelAuthGate({ children }: { children: React.ReactNode }) {
  const config = getWhiteLabelConfig()
  const { data: profile, isLoading, isError } = useGetUserProfileQuery()
  const { t } = useTranslation()

  // Not a custom domain or public mode — no gate
  if (!IS_CUSTOM_DOMAIN || !config || config.focus_mode === "public") {
    return <>{children}</>
  }

  // Loading auth state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  // Not logged in
  if (isError || !profile) {
    const redirectPath = window.location.pathname
    const origin = window.location.origin
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={3}
        sx={{ p: 4, textAlign: "center" }}
      >
        <Typography variant="h4">{config.name || "Organization"}</Typography>
        <Typography color="text.secondary">
          {t("whitelabel.loginRequired", "Sign in to access this workspace")}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={() => {
              window.location.href = `${BACKEND_URL}/auth/discord?path=${encodeURIComponent(redirectPath)}&action=signin&origin=${encodeURIComponent(origin)}`
            }}
          >
            {t("whitelabel.signInDiscord", "Sign in with Discord")}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              window.location.href = `${BACKEND_URL}/auth/citizenid?path=${encodeURIComponent(redirectPath)}&action=signin&origin=${encodeURIComponent(origin)}`
            }}
          >
            {t("whitelabel.signInCitizenId", "Sign in with Citizen ID")}
          </Button>
        </Box>
      </Box>
    )
  }

  // Logged in but membership required — check if user is a member
  if (config.require_membership) {
    const isMember = profile.contractors?.some(
      (c: { spectrum_id: string }) => c.spectrum_id === config.spectrum_id,
    )
    if (!isMember) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          gap={2}
          sx={{ p: 4, textAlign: "center" }}
        >
          <Typography variant="h5">{config.name || "Organization"}</Typography>
          <Typography color="text.secondary">
            {t("whitelabel.membershipRequired", "You must be a member of this organization to access this workspace.")}
          </Typography>
          <Button variant="outlined" href="https://sc-market.space">
            {t("whitelabel.backToMain", "Back to SC Market")}
          </Button>
        </Box>
      )
    }
  }

  return <>{children}</>
}
