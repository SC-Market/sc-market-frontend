import { BACKEND_URL, isCitizenIdEnabled } from "../../util/constants"
import { Button } from "@mui/material"
import React from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CitizenIDLogo } from "../icon/CitizenIDLogo"

export function LinkCitizenIDButton() {
  const location = useLocation()
  const { t } = useTranslation()

  if (!isCitizenIdEnabled) {
    return null
  }

  return (
    <Button
      onClick={() => {
        window.location.href = `${BACKEND_URL}/auth/citizenid/link`
      }}
      color="primary"
      variant="outlined"
      startIcon={<CitizenIDLogo />}
      aria-label={t("auth.linkCitizenID", "Link Citizen iD")}
      aria-describedby="link-citizenid-description"
    >
      {t("auth.linkCitizenID", "Link Citizen iD")}
      <span id="link-citizenid-description" className="sr-only">
        {t(
          "accessibility.linkCitizenIDDescription",
          "Link your Citizen iD account to your existing account",
        )}
      </span>
    </Button>
  )
}
