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
  Chip,
} from "@mui/material"
import {
  GetAppRounded,
  CloseRounded,
  CheckCircleRounded,
} from "@mui/icons-material"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true)
      return
    }

    // Check if prompt was dismissed in this session
    const dismissed = sessionStorage.getItem("pwa-install-dismissed")
    if (dismissed === "true") {
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      )
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
      setIsInstalled(true)
    } else {
      console.log("User dismissed the install prompt")
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    sessionStorage.setItem("pwa-install-dismissed", "true")
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

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
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <GetAppRounded color="primary" />
              <Typography variant="h6" component="div">
                Install SC Market
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Install our app for a better experience:
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" component="div">
                • Faster loading
              </Typography>
              <Typography variant="body2" component="div">
                • Offline access
              </Typography>
              <Typography variant="body2" component="div">
                • Home screen icon
              </Typography>
            </Stack>
          </Box>
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{ alignSelf: "flex-start" }}
          >
            <CloseRounded />
          </IconButton>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<GetAppRounded />}
          onClick={handleInstall}
        >
          Install
        </Button>
      </CardActions>
    </Card>
  )
}
