import { Box, Button, Container, Typography } from "@mui/material"
import { LockRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { PATHS, MARKET_PATHS } from "../../routes/paths"

export function ForbiddenPage({ message }: { message?: string }) {
  const { t } = useTranslation()

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", py: 10 }}>
      <LockRounded sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {t("errors.forbidden.title", "Access Denied")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {message || t("errors.forbidden.description", "You don't have permission to view this page.")}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button component={Link} to={PATHS.home} variant="contained">
          {t("errors.forbidden.goHome", "Go Home")}
        </Button>
        <Button component={Link} to={MARKET_PATHS.search} variant="outlined">
          {t("errors.forbidden.browseMarket", "Browse Market")}
        </Button>
      </Box>
    </Container>
  )
}
