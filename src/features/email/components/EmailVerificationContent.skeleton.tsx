import React from "react"
import { Box, CircularProgress, Typography, Grid } from "@mui/material"
import { useTranslation } from "react-i18next"

export function EmailVerificationContentSkeleton() {
  const { t } = useTranslation()
  return (
    <Grid item xs={12}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          textAlign: "center",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          {t("accessibility.loading")}
        </Typography>
      </Box>
    </Grid>
  )
}
