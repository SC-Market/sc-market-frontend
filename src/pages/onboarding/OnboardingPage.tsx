import React, { lazy, useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Discord } from "../../components/icon/DiscordIcon"
import { BACKEND_URL } from "../../util/constants"
import {
  useGetOnboardingStatusQuery,
  useCompleteOnboardingMutation,
} from "../../store/api/v2/market"
import { useProfileUpdateAvailabilityMutation } from "../../features/profile/api/profileApi"
import { useAddEmailMutation, useUpdateEmailPreferencesMutation } from "../../features/email"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import ScheduleIcon from "@mui/icons-material/Schedule"
import EmailIcon from "@mui/icons-material/Email"
import NotificationsIcon from "@mui/icons-material/Notifications"

const AvailabilitySelector = lazy(() =>
  import("../../components/time/AvailabilitySelector").then((module) => ({
    default: module.AvailabilitySelector,
  })),
)

interface AvailabilitySpan {
  start: number
  finish: number
}

interface OnboardingStep {
  key: string
  label: string
  icon: React.ReactNode
}

export function OnboardingPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()
  const issueAlert = useAlertHook()

  const { data: status, isLoading: statusLoading } =
    useGetOnboardingStatusQuery()
  const [completeOnboarding, { isLoading: completing }] =
    useCompleteOnboardingMutation()
  const [updateAvailability] = useProfileUpdateAvailabilityMutation()
  const [addEmail, { isLoading: addingEmail }] = useAddEmailMutation()
  const [updateEmailPreferences] = useUpdateEmailPreferencesMutation()


  const [activeStep, setActiveStep] = useState(0)
  const [emailInput, setEmailInput] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [dmReminders, setDmReminders] = useState(true)

  const steps = useMemo<OnboardingStep[]>(() => {
    const s: OnboardingStep[] = []
    if (!status?.steps.hasDiscord) {
      s.push({
        key: "discord",
        label: t("onboarding.steps.discord", "Link Discord"),
        icon: <Discord />,
      })
    }
    if (!status?.steps.hasAvailability) {
      s.push({
        key: "availability",
        label: t("onboarding.steps.availability", "Availability"),
        icon: <ScheduleIcon />,
      })
    }
    if (!status?.steps.hasEmail) {
      s.push({
        key: "email",
        label: t("onboarding.steps.email", "Email"),
        icon: <EmailIcon />,
      })
    }
    s.push({
      key: "notifications",
      label: t("onboarding.steps.notifications", "Notifications"),
      icon: <NotificationsIcon />,
    })
    return s
  }, [status, t])

  const currentStepKey = steps[activeStep]?.key

  const handleNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1)
    }
  }, [activeStep, steps.length])

  const handleSkipAll = useCallback(async () => {
    await completeOnboarding().unwrap()
    navigate("/dashboard")
  }, [completeOnboarding, navigate])

  const handleComplete = useCallback(async () => {
    try {
      await updateEmailPreferences({
        preferences: [
          { action_type_id: 82, enabled: dmReminders, frequency: "immediate" },
        ],
      }).unwrap()
      await completeOnboarding().unwrap()
      navigate("/dashboard")
    } catch {
      issueAlert({ severity: "error", message: "Failed to complete setup" })
    }
  }, [completeOnboarding, updateEmailPreferences, dmReminders, navigate, issueAlert])

  const handleLinkDiscord = useCallback(() => {
    window.location.href = `${BACKEND_URL}/auth/discord?path=${encodeURIComponent("/onboarding")}&action=link&origin=${encodeURIComponent(window.location.origin)}`
  }, [])

  const handleSaveAvailability = useCallback(
    async (selections: boolean[]) => {
      const spans: AvailabilitySpan[] = []
      let current: AvailabilitySpan | null = null

      for (let i = 0; i < selections.length; i++) {
        if (selections[i]) {
          if (current) {
            current.finish = i
          } else {
            current = { start: i, finish: i - 1 }
          }
        } else {
          if (current) {
            spans.push(current)
            current = null
          }
        }
      }
      if (current) spans.push(current)

      try {
        await updateAvailability({
          contractor: null,
          selections: spans,
        }).unwrap()
        issueAlert({
          severity: "success",
          message: t("onboarding.availabilitySaved", "Availability saved"),
        })
        handleNext()
      } catch {
        issueAlert({ severity: "error", message: "Failed to save availability" })
      }
    },
    [updateAvailability, issueAlert, handleNext, t],
  )

  const handleAddEmail = useCallback(async () => {
    if (!emailInput.trim()) return
    try {
      await addEmail({ email: emailInput.trim(), notificationTypeIds: [] }).unwrap()
      setEmailSent(true)
      issueAlert({
        severity: "success",
        message: t(
          "onboarding.emailVerificationSent",
          "Verification email sent! Check your inbox.",
        ),
      })
    } catch {
      issueAlert({ severity: "error", message: "Failed to add email" })
    }
  }, [emailInput, addEmail, issueAlert, t])

  useEffect(() => {
    if (!statusLoading && status?.completed) {
      navigate("/dashboard")
    }
  }, [statusLoading, status?.completed, navigate])

  if (statusLoading || status?.completed) return null

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ textAlign: "center" }}
          >
            {t("onboarding.welcome", "Welcome to SC Market")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            {t(
              "onboarding.subtitle",
              "Let's get your account set up so you can start trading.",
            )}
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={handleSkipAll}
            sx={{ mt: 1, color: "text.secondary" }}
          >
            {t("onboarding.skipAll", "Skip setup, I'll explore on my own")}
          </Button>
        </Stack>

        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? "vertical" : "horizontal"}
          alternativeLabel={!isMobile}
          sx={{ mb: 4 }}
        >
          {steps.map((step) => (
            <Step key={step.key}>
              <StepLabel
                StepIconProps={{
                  icon: step.icon,
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
          }}
        >
          {currentStepKey === "discord" && (
            <StepContent
              title={t("onboarding.discord.title", "Link your Discord account")}
              description={t(
                "onboarding.discord.description",
                "Connect Discord to receive trade notifications and communicate with buyers directly.",
              )}
            >
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Discord />}
                  onClick={handleLinkDiscord}
                  sx={{
                    bgcolor: "#5865F2",
                    "&:hover": { bgcolor: "#4752C4" },
                  }}
                >
                  {t("onboarding.discord.link", "Link Discord")}
                </Button>
                <Button variant="text" onClick={handleNext}>
                  {t("onboarding.skip", "Skip")}
                </Button>
              </Stack>
            </StepContent>
          )}

          {currentStepKey === "availability" && (
            <StepContent
              title={t(
                "onboarding.availability.title",
                "Set your availability",
              )}
              description={t(
                "onboarding.availability.description",
                "Let others know when you're online for trades. Drag to select time slots.",
              )}
            >
              <Box sx={{ mt: 2 }}>
                <React.Suspense fallback={null}>
                  <AvailabilitySelector
                    onSave={handleSaveAvailability}
                  />
                </React.Suspense>
              </Box>
              <Button
                variant="text"
                onClick={handleNext}
                sx={{ mt: 2 }}
              >
                {t("onboarding.skip", "Skip")}
              </Button>
            </StepContent>
          )}

          {currentStepKey === "email" && (
            <StepContent
              title={t("onboarding.email.title", "Add your email")}
              description={t(
                "onboarding.email.description",
                "Get notified about new messages and offers when you're away.",
              )}
            >
              {emailSent ? (
                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Typography color="success.main" variant="body2">
                    {t(
                      "onboarding.email.sent",
                      "Verification email sent! You can verify it later.",
                    )}
                  </Typography>
                  <Button variant="contained" onClick={handleNext}>
                    {t("onboarding.continue", "Continue")}
                  </Button>
                </Stack>
              ) : (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 3 }}
                  alignItems="flex-start"
                >
                  <TextField
                    size="small"
                    type="email"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    sx={{ minWidth: 280 }}
                  />
                  <LoadingButton
                    variant="contained"
                    loading={addingEmail}
                    onClick={handleAddEmail}
                    disabled={!emailInput.trim()}
                  >
                    {t("onboarding.email.verify", "Send verification")}
                  </LoadingButton>
                </Stack>
              )}
              <Button
                variant="text"
                onClick={handleNext}
                sx={{ mt: 2 }}
              >
                {t("onboarding.skip", "Skip")}
              </Button>
            </StepContent>
          )}

          {currentStepKey === "notifications" && (
            <StepContent
              title={t(
                "onboarding.notifications.title",
                "Notification preferences",
              )}
              description={t(
                "onboarding.notifications.description",
                "Choose how you'd like to be reminded about unread messages.",
              )}
            >
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dmReminders}
                      onChange={(e) => setDmReminders(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {t(
                          "onboarding.notifications.dmReminders",
                          "Email me about unread messages",
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t(
                          "onboarding.notifications.dmRemindersHelp",
                          "We'll send a reminder if you have messages waiting for more than 24 hours. You can change this anytime in Settings.",
                        )}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", ml: 0 }}
                />
              </Box>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <LoadingButton
                  variant="contained"
                  loading={completing}
                  onClick={handleComplete}
                >
                  {t("onboarding.complete", "Complete Setup")}
                </LoadingButton>
              </Stack>
            </StepContent>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

function StepContent({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      {children}
    </Box>
  )
}
