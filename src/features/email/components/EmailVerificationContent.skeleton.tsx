import React from "react"
import { Box, CircularProgress } from "@mui/material"
import { useTranslation } from "react-i18next"
import { PageCard } from "../../../components/paper/PageCard"

export function EmailVerificationContentSkeleton() {
  const { t } = useTranslation()
  return (
    <PageCard title={t("emailUi.verification.verifying")}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={48} aria-label={t("accessibility.loading")} />
      </Box>
    </PageCard>
  )
}
