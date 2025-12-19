import { BACKEND_URL } from "../../util/constants"
import { Button } from "@mui/material"
import React from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { Discord } from "../icon/DiscordIcon"
import { useTranslation } from "react-i18next"

export function DiscordLoginButton() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  // Get redirect path from query params (if coming from pageAuthentication redirect)
  // Otherwise use current pathname
  const redirectPath = searchParams.get("redirect") || location.pathname

  return (
    <Button
      onClick={() => {
        window.location.href = `${BACKEND_URL}/auth/discord?path=${encodeURIComponent(redirectPath)}`
      }}
      color="secondary"
      variant="contained"
      startIcon={<Discord />}
      aria-label={t("auth.loginWithDiscord", "Login with Discord")}
      aria-describedby="discord-login-description"
    >
      {t("auth.loginWithDiscord", "Login with Discord")}
      <span id="discord-login-description" className="sr-only">
        {t(
          "accessibility.loginWithDiscordDescription",
          "Authenticate using your Discord account",
        )}
      </span>
    </Button>
  )
}
