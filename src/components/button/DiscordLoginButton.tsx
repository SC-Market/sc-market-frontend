import { BACKEND_URL } from "../../util/constants"
import { Button } from "@mui/material"
import React from "react"
import { useLocation } from "react-router-dom"
import { Discord } from "../icon/DiscordIcon"
import { useTranslation } from "react-i18next"

export function DiscordLoginButton() {
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <Button
      onClick={() => {
        window.location.href = `${BACKEND_URL}/auth/discord?path=${encodeURIComponent(
          location.pathname === "/" ? "/market" : location.pathname,
        )}`
      }}
      color="secondary"
      variant="contained"
      startIcon={<Discord />}
    >
      {t("auth.loginWithDiscord", "Login with Discord")}
    </Button>
  )
}
