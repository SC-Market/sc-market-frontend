import React, { useMemo } from "react"
import { Box, Button, Stack, TextField, Typography } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { DiscordIcon } from "../../components/icons/DiscordIcon"
import ScheduleIcon from "@mui/icons-material/ScheduleRounded"
import EmailIcon from "@mui/icons-material/EmailRounded"
import NotificationsIcon from "@mui/icons-material/NotificationsRounded"
import GroupsIcon from "@mui/icons-material/GroupsRounded"
import { PATHS } from "../../routes/paths"
import { lazyWithRetry } from "../../util/lazyWithRetry"
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded"
import AddRounded from "@mui/icons-material/AddRounded"

import { type GetOnboardingStatusApiResponse } from "../../store/api/v2/market"

const AvailabilitySelector = lazyWithRetry(() =>
  import("../../components/time/AvailabilitySelector").then((module) => ({
    default: module.AvailabilitySelector,
  })),
)

export interface AvailabilitySpan {
  start: number
  finish: number
}

export interface OnboardingStep {
  key: string
  label: string
  icon: React.ReactNode
}

/** The onboarding steps this account still needs, in order. */
export function useOnboardingSteps(
  status: GetOnboardingStatusApiResponse | undefined,
  pushSupported: boolean,
  pushConfigured: boolean,
) {
  const { t } = useTranslation()
  return useMemo<OnboardingStep[]>(() => {
    const s: OnboardingStep[] = []
    if (!status?.steps.hasDiscord) {
      s.push({
        key: "discord",
        label: t("onboarding.steps.discord", "Link Discord"),
        icon: <DiscordIcon />,
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
      key: "org",
      label: t("onboarding.steps.org", "Organization"),
      icon: <GroupsIcon />,
    })
    s.push({
      key: "email-notifs",
      label: t("onboarding.steps.emailNotifs", "Email Alerts"),
      icon: <EmailIcon />,
    })
    if (pushSupported && pushConfigured) {
      s.push({
        key: "push-notifs",
        label: t("onboarding.steps.pushNotifs", "Push Alerts"),
        icon: <NotificationsIcon />,
      })
    }
    return s
  }, [status, t, pushSupported, pushConfigured])
}

/** Selected half-hour slots -> contiguous availability spans. */
export function availabilitySpans(selections: boolean[]): AvailabilitySpan[] {
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
  return spans
}

/** Step: link a Discord account. */
export function DiscordStep({
  handleLinkDiscord,
  handleNext,
}: {
  handleLinkDiscord: () => void
  handleNext: () => void
}) {
  const { t } = useTranslation()
  return (
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
          color="discord"
          startIcon={<DiscordIcon />}
          onClick={handleLinkDiscord}
        >
          {t("onboarding.discord.link", "Link Discord")}
        </Button>
        <Button variant="text" onClick={handleNext}>
          {t("onboarding.skip", "Skip")}
        </Button>
      </Stack>
    </StepContent>
  )
}

/** Step: set weekly availability. */
export function AvailabilityStep({
  handleSaveAvailability,
  handleNext,
}: {
  handleSaveAvailability: (selections: boolean[]) => void
  handleNext: () => void
}) {
  const { t } = useTranslation()
  return (
    <StepContent
      title={t("onboarding.availability.title", "Set your availability")}
      description={t(
        "onboarding.availability.description",
        "Let others know when you're online for trades. Drag to select time slots.",
      )}
    >
      <Box sx={{ mt: 2 }}>
        <React.Suspense fallback={null}>
          <AvailabilitySelector onSave={handleSaveAvailability} />
        </React.Suspense>
      </Box>
      <Button variant="text" onClick={handleNext} sx={{ mt: 2 }}>
        {t("onboarding.skip", "Skip")}
      </Button>
    </StepContent>
  )
}

/** Step: add and verify an email address. */
export function EmailStep({
  emailSent,
  emailInput,
  setEmailInput,
  addingEmail,
  handleAddEmail,
  handleNext,
}: {
  emailSent: boolean
  emailInput: string
  setEmailInput: (value: string) => void
  addingEmail: boolean
  handleAddEmail: () => void
  handleNext: () => void
}) {
  const { t } = useTranslation()
  return (
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
              "Verification email sent. You can verify it later.",
            )}
          </Typography>
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ChevronRightRounded />}
          >
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
      <Button variant="text" onClick={handleNext} sx={{ mt: 2 }}>
        {t("onboarding.skip", "Skip")}
      </Button>
    </StepContent>
  )
}

/** Step: offer to register an organization. */
export function OrgStep({ handleNext }: { handleNext: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <StepContent
      title={t("onboarding.org.title", "Register an organization")}
      description={t(
        "onboarding.org.description",
        "If you run a Star Citizen org, you can register it to manage members, listings, and orders as a group.",
      )}
    >
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => navigate(PATHS.orgRegister)}
          startIcon={<AddRounded />}
        >
          {t("onboarding.org.register", "Register Organization")}
        </Button>
        <Button variant="text" onClick={handleNext}>
          {t("onboarding.skip", "Skip")}
        </Button>
      </Stack>
    </StepContent>
  )
}

export function StepContent({
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
