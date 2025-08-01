import { IconButton, Tooltip } from "@mui/material"
import { KeyboardArrowLeftRounded } from "@mui/icons-material"
import React from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function BackArrow() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Tooltip title={t("navigation.goBack", "Go Back")}>
      <IconButton onClick={() => navigate(-1)}>
        <KeyboardArrowLeftRounded />
      </IconButton>
    </Tooltip>
  )
}
