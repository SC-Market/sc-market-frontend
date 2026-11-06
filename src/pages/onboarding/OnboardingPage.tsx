import { useCallback, useEffect, useState } from "react"
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import LoadingButton from "@mui/lab/LoadingButton"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { BACKEND_URL } from "../../util/constants"
import {
  useGetOnboardingStatusQuery,
  useCompleteOnboardingMutation,
} from "../../store/api/v2/market"
import { useProfileUpdateAvailabilityMutation } from "../../features/profile/api/profileApi"
import { useAddEmailMutation, useEmailSettings } from "../../features/email"
import {
  usePushSubscription,
  usePushSettings,
} from "../../features/push-notifications"
import { useGetNotificationTypesQuery } from "../../features/email"
import { PreferenceSection } from "../../components/settings/PreferenceSection"
import { PushNotificationSubscription } from "../../features/push-notifications"
import { formatActionName } from "../../features/email"
import type { EmailPreference } from "../../features/email"
import type { PushPreference } from "../../features/push-notifications"
import { useDispatch } from "react-redux"
import { serviceApi } from "../../store/service"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { PATHS } from "../../routes/paths"
import { usePageReady } from "../../components/metadata/PageReady"
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded"

import {
  AvailabilityStep,
  availabilitySpans,
  DiscordStep,
  EmailStep,
  OrgStep,
  StepContent,
  useOnboardingSteps,
} from "./OnboardingSteps"

export function OnboardingPage() {
  usePageReady(false)
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const issueAlert = useAlertHook()

  const { data: status, isLoading: statusLoading } =
    useGetOnboardingStatusQuery()
  const [completeOnboarding, { isLoading: completing }] =
    useCompleteOnboardingMutation()
  const [updateAvailability] = useProfileUpdateAvailabilityMutation()
  const [addEmail, { isLoading: addingEmail }] = useAddEmailMutation()

  // Notification settings hooks (same as settings page)
  const {
    preferences: emailPreferences,
    preferencesLoading: emailPrefsLoading,
    handlePreferenceChange: handleEmailPrefChange,
    handleBatchPreferenceChange: handleEmailBatchChange,
  } = useEmailSettings()

  const {
    preferences: pushPreferences,
    preferencesLoading: pushPrefsLoading,
    handlePreferenceChange: handlePushPrefChange,
    handleBatchPreferenceChange: handlePushBatchChange,
  } = usePushSettings()

  const { data: notificationTypesData } = useGetNotificationTypesQuery()

  const {
    isSupported: pushSupported,
    isPermissionGranted: pushGranted,
    isConfigured: pushConfigured,
    handleSubscribe: handlePushSubscribe,
    isSubscribing: pushSubscribing,
  } = usePushSubscription()

  const [activeStep, setActiveStep] = useState(0)
  const [emailInput, setEmailInput] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const steps = useOnboardingSteps(status, pushSupported, pushConfigured)

  const currentStepKey = steps[activeStep]?.key
  const isLastStep = activeStep === steps.length - 1

  const availableNotificationTypes =
    notificationTypesData?.notificationTypes.map((type) => ({
      id: type.action_type_id,
      name: formatActionName(type.action),
      description: type.description || undefined,
      action: type.action,
    })) || []

  const handleNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1)
    }
  }, [activeStep, steps.length])

  const handleSkipAll = useCallback(async () => {
    await completeOnboarding().unwrap()
    dispatch(serviceApi.util.invalidateTags(["MyProfile"]))
    navigate(PATHS.dashboard)
  }, [completeOnboarding, dispatch, navigate])

  const handleComplete = useCallback(async () => {
    try {
      await completeOnboarding().unwrap()
      dispatch(serviceApi.util.invalidateTags(["MyProfile"]))
      navigate(PATHS.dashboard)
    } catch {
      issueAlert({ severity: "error", message: t("onboarding.setupFailed") })
    }
  }, [completeOnboarding, dispatch, navigate, issueAlert, t])

  const handleLinkDiscord = useCallback(() => {
    window.location.href = `${BACKEND_URL}/auth/discord?path=${encodeURIComponent("/onboarding")}&action=link&origin=${encodeURIComponent(window.location.origin)}`
  }, [])

  const handleSaveAvailability = useCallback(
    async (selections: boolean[]) => {
      const spans = availabilitySpans(selections)

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
        issueAlert({
          severity: "error",
          message: t("onboarding.availabilityFailed"),
        })
      }
    },
    [updateAvailability, issueAlert, handleNext, t],
  )

  const handleAddEmail = useCallback(async () => {
    if (!emailInput.trim()) return
    try {
      await addEmail({
        email: emailInput.trim(),
        notificationTypeIds: [],
      }).unwrap()
      setEmailSent(true)
      issueAlert({
        severity: "success",
        message: t(
          "onboarding.emailVerificationSent",
          "Verification email sent. Check your inbox.",
        ),
      })
    } catch {
      issueAlert({ severity: "error", message: t("onboarding.emailFailed") })
    }
  }, [emailInput, addEmail, issueAlert, t])

  useEffect(() => {
    if (!statusLoading && status?.completed) {
      navigate(PATHS.dashboard)
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
            <DiscordStep
              handleLinkDiscord={handleLinkDiscord}
              handleNext={handleNext}
            />
          )}

          {currentStepKey === "availability" && (
            <AvailabilityStep
              handleSaveAvailability={handleSaveAvailability}
              handleNext={handleNext}
            />
          )}

          {currentStepKey === "email" && (
            <EmailStep
              emailSent={emailSent}
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              addingEmail={addingEmail}
              handleAddEmail={handleAddEmail}
              handleNext={handleNext}
            />
          )}

          {currentStepKey === "org" && <OrgStep handleNext={handleNext} />}

          {currentStepKey === "email-notifs" && (
            <StepContent
              title={t("onboarding.emailNotifs.title", "Email notifications")}
              description={t(
                "onboarding.emailNotifs.description",
                "Choose which events send you an email. You can change these anytime in Settings.",
              )}
            >
              <Box sx={{ mt: 2 }}>
                <PreferenceSection
                  title={t(
                    "onboarding.emailNotifs.prefsTitle",
                    "Email preferences",
                  )}
                  preferences={emailPreferences?.preferences?.individual || []}
                  notificationTypes={availableNotificationTypes}
                  onPreferenceChange={(pref, enabled) =>
                    handleEmailPrefChange(
                      pref as EmailPreference,
                      enabled,
                      null,
                    )
                  }
                  onBatchPreferenceChange={(updates) =>
                    handleEmailBatchChange(updates, null)
                  }
                  type="email"
                  contractorId={null}
                  isLoading={emailPrefsLoading || !notificationTypesData}
                />
              </Box>
              {isLastStep ? (
                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <LoadingButton
                    variant="contained"
                    loading={completing}
                    onClick={handleComplete}
                  >
                    {t("onboarding.complete", "Complete Setup")}
                  </LoadingButton>
                </Stack>
              ) : (
                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ChevronRightRounded />}
                  >
                    {t("onboarding.continue", "Continue")}
                  </Button>
                  <Button variant="text" onClick={handleNext}>
                    {t("onboarding.skip", "Skip")}
                  </Button>
                </Stack>
              )}
            </StepContent>
          )}

          {currentStepKey === "push-notifs" && (
            <StepContent
              title={t("onboarding.pushNotifs.title", "Push notifications")}
              description={t(
                "onboarding.pushNotifs.description",
                "Get alerts on this device for new messages, orders, and offers.",
              )}
            >
              <Box sx={{ mt: 2 }}>
                {!pushGranted ? (
                  <PushNotificationSubscription
                    onSubscribe={handlePushSubscribe}
                    isSubscribing={pushSubscribing}
                    isPermissionGranted={pushGranted}
                    isConfigured={pushConfigured}
                    requiresPWAInstall={false}
                  />
                ) : (
                  <PreferenceSection
                    title={t(
                      "onboarding.pushNotifs.prefsTitle",
                      "Push preferences",
                    )}
                    preferences={pushPreferences?.preferences?.individual || []}
                    notificationTypes={availableNotificationTypes}
                    onPreferenceChange={(pref, enabled) =>
                      handlePushPrefChange(
                        pref as PushPreference,
                        enabled,
                        null,
                      )
                    }
                    onBatchPreferenceChange={(updates) =>
                      handlePushBatchChange(updates, null)
                    }
                    type="push"
                    contractorId={null}
                    isLoading={pushPrefsLoading || !notificationTypesData}
                  />
                )}
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
