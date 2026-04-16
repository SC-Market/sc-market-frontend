import { BACKEND_URL } from "../../util/constants"
import { Button } from "@mui/material"
import React from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { Discord } from "../icon/DiscordIcon"
import { useTranslation } from "react-i18next"

export function DiscordSignUpButton() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  // Get redirect path from query params (if coming from pageAuthentication redirect)
  // Otherwise use current pathname
  const redirectPath = searchParams.get("redirect") || location.pathname

  return (
    <Button
      onClick={() => {
        window.location.href = `${BACKEND_URL}/auth/discord?path=${encodeURIComponent(redirectPath)}&action=signup`
      }}
      color="secondary"
      variant="contained"
      startIcon={<Discord />}
      aria-label={t("auth.signUpWithDiscord", "Sign up with Discord")}
      aria-describedby="discord-signup-description"
    >
      {t("auth.signUpWithDiscord", "Sign up with Discord")}
      <span id="discord-signup-description" className="sr-only">
        {t(
          "accessibility.signUpWithDiscordDescription",
          "Create a new account using your Discord account",
        )}
      </span>
    </Button>
  )
}
