import React from "react"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Alert, Box, Button, CircularProgress } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { UnsubscribePageData } from "../hooks/usePageUnsubscribe"
import { PATHS } from "../../../routes/paths"
import { PageCard, PageCardActions } from "../../../components/paper/PageCard"

interface UnsubscribeContentProps {
  data: UnsubscribePageData
  isLoading: boolean
  onUnsubscribeAll: () => void
  isUnsubscribingAll: boolean
}

/** Settings → Notifications (asks to sign in when signed out). */
const MANAGE_URL = `${PATHS.settings}?tab=notifications`

export function UnsubscribeContent({
  data,
  isLoading,
  onUnsubscribeAll,
  isUnsubscribingAll,
}: UnsubscribeContentProps) {
  const { t } = useTranslation()
  const manage = (
    <Button
      variant="outlined"
      color="primary"
      component={RouterLink}
      to={MANAGE_URL}
    >
      {t("emailUi.unsubscribe.managePreferences")}
    </Button>
  )

  if (data.status === "loading" || isLoading) {
    return (
      <PageCard title={t("emailUi.unsubscribe.unsubscribing")}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={48} aria-busy="true" />
        </Box>
      </PageCard>
    )
  }

  if (data.status === "success") {
    return (
      <PageCard
        title={t("emailUi.unsubscribe.successTitle")}
        icon={<CheckCircleIcon sx={{ color: "success.main" }} />}
      >
        <Alert severity="success">
          {data.messageKey ? t(data.messageKey) : data.message}
        </Alert>
        <PageCardActions>
          {!data.all && (
            <Button
              variant="contained"
              color="primary"
              onClick={onUnsubscribeAll}
              disabled={isUnsubscribingAll}
            >
              {t("emailUi.unsubscribe.turnOffAll")}
            </Button>
          )}
          {manage}
        </PageCardActions>
      </PageCard>
    )
  }

  const severity = data.status === "error" ? "error" : "warning"
  return (
    <PageCard
      title={t("emailUi.unsubscribe.failedTitle")}
      icon={<ErrorIcon sx={{ color: `${severity}.main` }} />}
    >
      <Alert severity={severity}>
        {data.messageKey ? t(data.messageKey) : data.message}
      </Alert>
      <PageCardActions>{manage}</PageCardActions>
    </PageCard>
  )
}
