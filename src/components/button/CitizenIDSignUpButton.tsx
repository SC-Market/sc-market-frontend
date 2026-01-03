import { BACKEND_URL, isCitizenIdEnabled } from "../../util/constants"
import { Button } from "@mui/material"
import React from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CitizenIDLogo } from "../icon/CitizenIDLogo"

export function CitizenIDSignUpButton() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  if (!isCitizenIdEnabled) {
    return null
  }

  // Get redirect path from query params (if coming from pageAuthentication redirect)
  // Otherwise use current pathname
  const redirectPath = searchParams.get("redirect") || location.pathname

  return (
    <Button
      onClick={() => {
        window.location.href = `${BACKEND_URL}/auth/citizenid?path=${encodeURIComponent(redirectPath)}&action=signup`
      }}
      color="primary"
      variant="contained"
      startIcon={<CitizenIDLogo />}
      aria-label={t("auth.signUpWithCitizenID", "Sign up with Citizen iD")}
      aria-describedby="citizenid-signup-description"
    >
      {t("auth.signUpWithCitizenID", "Sign up with Citizen iD")}
      <span id="citizenid-signup-description" className="sr-only">
        {t(
          "accessibility.signUpWithCitizenIDDescription",
          "Create a new account using your Citizen iD account",
        )}
      </span>
    </Button>
  )
}
