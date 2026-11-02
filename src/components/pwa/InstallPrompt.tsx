import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Stack,
} from "@mui/material"
import {
  GetAppRounded,
  CloseRounded,
} from "@mui/icons-material"
import { usePWAInstallPrompt } from "../../hooks/pwa/usePWAInstallPrompt"
import { useTranslation } from "react-i18next"

const DISMISS_KEY = "pwa_install_dismissed"

export function InstallPrompt() {
  const { t } = useTranslation()
  const { canInstall, isInstalled, triggerInstall } = usePWAInstallPrompt()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (isInstalled) return
    try {
      if (localStorage.getItem(DISMISS_KEY)) return
    } catch {}
    if (canInstall) setShowPrompt(true)
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    const success = await triggerInstall()
    if (success) setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    try { localStorage.setItem(DISMISS_KEY, "1") } catch {}
  }

  if (isInstalled || !showPrompt || !canInstall) return null

  return (
    <Card
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        maxWidth: 360,
        zIndex: 1300,
        boxShadow: 6,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <GetAppRounded color="primary" />
              <Typography variant="h6" component="div">
                {t("appUi.pwa.installTitle")}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("appUi.pwa.installIntro")}
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" component="div">• {t("appUi.pwa.benefitFaster")}</Typography>
              <Typography variant="body2" component="div">• {t("appUi.pwa.benefitOffline")}</Typography>
              <Typography variant="body2" component="div">• {t("appUi.pwa.benefitHomeScreen")}</Typography>
            </Stack>
          </Box>
          <IconButton aria-label={t("appUi.pwa.dismissInstall")} size="small" onClick={handleDismiss} sx={{ alignSelf: "flex-start" }}>
            <CloseRounded />
          </IconButton>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="contained" fullWidth startIcon={<GetAppRounded />} onClick={handleInstall}>
          {t("appUi.pwa.install")}
        </Button>
      </CardActions>
    </Card>
  )
}
