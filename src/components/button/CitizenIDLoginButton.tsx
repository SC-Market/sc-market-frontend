import { BACKEND_URL } from "../../util/constants"
import { Button } from "@mui/material"
import React from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CitizenIDLogo } from "../icon/CitizenIDLogo"

export function CitizenIDLoginButton() {
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <Button
      onClick={() => {
        window.location.href = `${BACKEND_URL}/auth/citizenid?path=${encodeURIComponent(
          location.pathname === "/" ? "/market" : location.pathname,
        )}`
      }}
      color="primary"
      variant="contained"
      startIcon={<CitizenIDLogo />}
      aria-label={t("auth.loginWithCitizenID", "Sign in with Citizen iD")}
      aria-describedby="citizenid-login-description"
    >
      {t("auth.loginWithCitizenID", "Sign in with Citizen iD")}
      <span id="citizenid-login-description" className="sr-only">
        {t(
          "accessibility.loginWithCitizenIDDescription",
          "Authenticate using your Citizen ID account",
        )}
      </span>
    </Button>
  )
}
