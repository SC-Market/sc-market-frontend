import { BACKEND_URL } from "../../util/constants"
import { Button } from "@mui/material"
import React from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { Discord } from "../icon/DiscordIcon"
import { useTranslation } from "react-i18next"
import { open } from "@tauri-apps/plugin-shell"

// Check if running in Tauri
const isTauri = typeof window !== "undefined" && "__TAURI__" in window

export function DiscordLoginButton() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  // Get redirect path from query params (if coming from pageAuthentication redirect)
  // Otherwise use current pathname
  const redirectPath = searchParams.get("redirect") || location.pathname

  const handleLogin = async () => {
    const authUrl = `${BACKEND_URL}/auth/discord?path=${encodeURIComponent(redirectPath)}&action=signin`
    
    if (isTauri) {
      // Open in system browser for Tauri
      await open(authUrl)
    } else {
      // Normal web flow
      window.location.href = authUrl
    }
  }

  return (
    <Button
      onClick={handleLogin}
      color="secondary"
      variant="contained"
      startIcon={<Discord />}
      aria-label={t("auth.signInWithDiscord", "Sign in with Discord")}
      aria-describedby="discord-login-description"
    >
      {t("auth.signInWithDiscord", "Sign in with Discord")}
      <span id="discord-login-description" className="sr-only">
        {t(
          "accessibility.signInWithDiscordDescription",
          "Sign in using your Discord account",
        )}
      </span>
    </Button>
  )
}
