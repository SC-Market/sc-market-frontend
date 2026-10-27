import React from "react"
import { Box, Paper, Typography } from "@mui/material"
import StarRounded from "@mui/icons-material/StarRounded"
import AttachMoneyRounded from "@mui/icons-material/AttachMoneyRounded"
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded"
import GroupsRounded from "@mui/icons-material/GroupsRounded"
import { useTranslation } from "react-i18next"
import { LandingSection, LandingSectionHeader } from "./LandingSection"
import { SupportersSection } from "./SupportersSection"

/** "Why SC Market": four trust points, then the supporters. Static. */
export function LandingTrust() {
  const { t } = useTranslation()
  const points = [
    {
      icon: <StarRounded />,
      title: t("landing.trustReviewsTitle"),
      text: t("landing.trustReviewsText"),
    },
    {
      icon: <AttachMoneyRounded />,
      title: t("landing.trustFeesTitle"),
      text: t("landing.trustFeesText"),
    },
    {
      icon: <NotificationsActiveRounded />,
      title: t("landing.trustAlertsTitle"),
      text: t("landing.trustAlertsText"),
    },
    {
      icon: <GroupsRounded />,
      title: t("landing.trustOrgsTitle"),
      text: t("landing.trustOrgsText"),
    },
  ]
  return (
    <LandingSection labelledBy="landing-why-title" testId="landing-why">
      <LandingSectionHeader id="landing-why-title" title={t("landing.whyTitle")} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        {points.map((point) => (
          <Paper key={point.title} sx={{ p: 2 }}>
            <Box
              aria-hidden
              sx={{ color: "primary.main", lineHeight: 0, mb: 0.75 }}
            >
              {point.icon}
            </Box>
            <Typography
              component="h3"
              color="text.secondary"
              sx={{ fontWeight: "bold", mb: 0.5 }}
            >
              {point.title}
            </Typography>
            <Typography variant="body2" color="text.primary">
              {point.text}
            </Typography>
          </Paper>
        ))}
      </Box>
      <SupportersSection />
    </LandingSection>
  )
}
