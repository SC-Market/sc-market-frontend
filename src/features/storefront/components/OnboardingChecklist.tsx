import React from "react"
import {
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded"
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useGetOrgStorefrontStatusQuery,
  type OnboardingStep,
} from "../../../store/api/v2/market"
import { ORG_PATHS, PATHS, SHOP_PATHS } from "../../../routes/paths"

/** Where each open step is done. */
function stepLink(
  step: OnboardingStep["key"],
  spectrumId: string,
  shopSlug: string | null | undefined,
): string {
  switch (step) {
    case "verify":
      return PATHS.orgRegister
    case "shop":
      return SHOP_PATHS.createShop
    case "listing":
      return shopSlug ? SHOP_PATHS.create(shopSlug) : SHOP_PATHS.createShop
    case "discord":
      return ORG_PATHS.manageDiscord(spectrumId)
    case "members":
      return ORG_PATHS.manageInvites(spectrumId)
    case "branding":
      return ORG_PATHS.manageStorefront(spectrumId)
  }
}

/**
 * Org settings › Storefront: the storefront onboarding checklist (verify,
 * open a shop, first listing, Discord, members, branding), from the org's
 * data (GET /contractors/:sid/storefront/status). Target: the first
 * listing within 15 minutes.
 */
export function OnboardingChecklist(props: { spectrumId: string }) {
  const { t } = useTranslation()
  const { data } = useGetOrgStorefrontStatusQuery({
    spectrumId: props.spectrumId,
  })
  const list = data?.onboarding
  if (!list) return null
  const labels: Record<
    OnboardingStep["key"],
    { title: string; action: string }
  > = {
    verify: {
      title: t(
        "storefront.onboarding.verify",
        "Verify your org through its RSI page",
      ),
      action: t("storefront.onboarding.verifyAction", "Verify"),
    },
    shop: {
      title: t("storefront.onboarding.shop", "Open the org's shop"),
      action: t("storefront.onboarding.shopAction", "Open a shop"),
    },
    listing: {
      title: t("storefront.onboarding.listing", "Add your first listing"),
      action: t("storefront.onboarding.listingAction", "Add a listing"),
    },
    discord: {
      title: t(
        "storefront.onboarding.discord",
        "Connect Discord, so orders land in your server",
      ),
      action: t("storefront.onboarding.discordAction", "Set up Discord"),
    },
    members: {
      title: t("storefront.onboarding.members", "Bring in 3 or more members"),
      action: t("storefront.onboarding.membersAction", "Invite members"),
    },
    branding: {
      title: t("storefront.onboarding.branding", "Unlock branding"),
      action: t("storefront.onboarding.brandingAction", "See what's missing"),
    },
  }
  const done = list.done_count === list.total

  return (
    <Paper sx={{ p: 2 }} data-testid="storefront-onboarding">
      <Typography variant="h6" component="h2" color="text.secondary">
        {t("storefront.onboarding.title", "Set up your storefront")}
      </Typography>
      <Typography variant="body2" color="text.primary">
        {done
          ? t(
              "storefront.onboarding.done",
              "All set. Share your storefront link, or put the widget below on your site.",
            )
          : t(
              "storefront.onboarding.intro",
              "Work through these steps to get your storefront ready.",
            )}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={(list.done_count / list.total) * 100}
          sx={{ flex: 1, height: 8, borderRadius: 4 }}
          aria-label={t("storefront.onboarding.progress", "Setup progress")}
        />
        <Typography variant="caption" color="text.primary">
          {list.done_count}/{list.total}
        </Typography>
      </Stack>
      <List dense>
        {list.steps.map((step) => (
          <ListItem
            key={step.key}
            disableGutters
            secondaryAction={
              step.done ? undefined : (
                <Button
                  size="small"
                  component={Link}
                  to={stepLink(step.key, props.spectrumId, list.shop_slug)}
                >
                  {labels[step.key].action}
                </Button>
              )
            }
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {step.done ? (
                <CheckCircleRounded color="success" aria-hidden />
              ) : (
                <RadioButtonUncheckedRounded color="disabled" aria-hidden />
              )}
            </ListItemIcon>
            <ListItemText
              primary={labels[step.key].title}
              primaryTypographyProps={{
                color: step.done ? "text.primary" : "text.secondary",
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
