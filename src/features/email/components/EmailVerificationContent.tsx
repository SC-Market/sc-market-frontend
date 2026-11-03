import React from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Alert, Box, Button, CircularProgress } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { EmailVerificationPageData } from "../hooks/usePageEmailVerification"
import { PageCard, PageCardActions } from "../../../components/paper/PageCard"

interface EmailVerificationContentProps {
  data: EmailVerificationPageData
  isLoading: boolean
}

export function EmailVerificationContent({
  data,
  isLoading,
}: EmailVerificationContentProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (data.status === "loading" || isLoading) {
    return (
      <PageCard title={t("emailUi.verification.verifying")}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={48} aria-busy="true" />
        </Box>
      </PageCard>
    )
  }

  const goToSettings = (
    <PageCardActions>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/settings?tab=email")}
      >
        {t("emailUi.verification.goToSettings")}
      </Button>
    </PageCardActions>
  )
  const message = data.messageKey ? t(data.messageKey) : data.message

  if (data.status === "success") {
    return (
      <PageCard
        title={t("emailUi.verification.successTitle")}
        icon={<CheckCircleIcon sx={{ color: "success.main" }} />}
      >
        <Alert severity="success">{message}</Alert>
        {goToSettings}
      </PageCard>
    )
  }

  const severity = data.status === "error" ? "error" : "warning"
  return (
    <PageCard
      title={
        data.status === "error"
          ? t("emailUi.verification.failedTitle")
          : t("emailUi.verification.invalidTitle")
      }
      icon={<ErrorIcon sx={{ color: `${severity}.main` }} />}
    >
      <Alert severity={severity}>{message}</Alert>
      {goToSettings}
    </PageCard>
  )
}
