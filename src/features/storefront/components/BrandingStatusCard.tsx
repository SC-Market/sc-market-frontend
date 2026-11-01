import React from "react"
import {
  Alert,
  Box,
  Chip,
  Link as MuiLink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded"
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useGetOrgStorefrontStatusQuery } from "../../../store/api/v2/market"
import { ORG_PATHS, PATHS } from "../../../routes/paths"
import { EnquireBrandedStorefront } from "./EnquireBrandedStorefront"

function Criterion(props: { met: boolean; primary: string; secondary?: React.ReactNode }) {
  return (
    <ListItem disableGutters sx={{ alignItems: "flex-start" }}>
      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
        {props.met ? (
          <CheckCircleRounded color="success" aria-hidden />
        ) : (
          <RadioButtonUncheckedRounded color="disabled" aria-hidden />
        )}
      </ListItemIcon>
      <ListItemText
        primary={props.primary}
        secondary={props.secondary}
        primaryTypographyProps={{ color: "text.secondary" }}
      />
    </ListItem>
  )
}

/**
 * Org settings › Storefront: whether the org's branding is unlocked, what it
 * unlocks, and which criteria are still missing (each with where to do it).
 */
export function BrandingStatusCard(props: { spectrumId: string }) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetOrgStorefrontStatusQuery({
    spectrumId: props.spectrumId,
  })

  if (isLoading) return <Skeleton variant="rounded" height={260} />
  if (isError || !data) {
    return (
      <Alert severity="warning">
        {t("storefront.status.loadFailed", "The storefront status couldn't be loaded. Try again later.")}
      </Alert>
    )
  }

  const { branding } = data
  const { criteria } = branding
  const subdomain = `${props.spectrumId.toLowerCase()}.sc-market.space`

  return (
    <Paper sx={{ p: 2 }} data-testid="branding-status">
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="h6" component="h2" color="text.secondary">
          {t("storefront.status.title", "Branded storefront")}
        </Typography>
        <Chip
          size="small"
          color={branding.unlocked ? "success" : "default"}
          label={
            branding.unlocked
              ? t("storefront.status.unlocked", "Unlocked")
              : t("storefront.status.locked", "Locked")
          }
        />
      </Stack>
      <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
        {branding.source === "grant"
          ? t("storefront.status.byGrant", "SC Market staff unlocked branding for your org.")
          : branding.unlocked
            ? t("storefront.status.byCriteria", "Your org meets all three criteria, so branding is unlocked. It stays unlocked while it does.")
            : t("storefront.status.howToUnlock", "Storefronts are free. Branding unlocks by itself once your org meets these three criteria:")}
      </Typography>

      <List dense sx={{ mt: 1 }}>
        <Criterion
          met={criteria.rsi_verified}
          primary={t("storefront.criteria.verified", "RSI-verified org")}
          secondary={
            criteria.rsi_verified ? (
              t("storefront.criteria.verifiedMet", "Registered through its RSI org page.")
            ) : (
              <>
                {t("storefront.criteria.verifiedMissing", "Register your org through its RSI org page to verify it.")}{" "}
                <MuiLink component={Link} to={PATHS.orgRegister}>
                  {t("storefront.criteria.verifyAction", "Verify an org")}
                </MuiLink>
              </>
            )
          }
        />
        <Criterion
          met={criteria.members.met}
          primary={t("storefront.criteria.members", {
            count: criteria.members.count,
            required: criteria.members.required,
            defaultValue: "Members on SC Market: {{count}} of {{required}}",
          })}
          secondary={
            criteria.members.met ? undefined : (
              <MuiLink component={Link} to={ORG_PATHS.manageInvites(props.spectrumId)}>
                {t("storefront.criteria.membersAction", "Invite members")}
              </MuiLink>
            )
          }
        />
        <Criterion
          met={criteria.activity.met}
          primary={t("storefront.criteria.activity", {
            days: criteria.activity.window_days,
            defaultValue: "A listing or an order in the last {{days}} days",
          })}
          secondary={t("storefront.criteria.activityCounts", {
            listings: criteria.activity.recent_listings,
            orders: criteria.activity.recent_orders,
            defaultValue: "Listings created or updated: {{listings}}. Orders: {{orders}}.",
          })}
        />
      </List>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
        {t("storefront.status.unlocksTitle", "What branding unlocks")}
      </Typography>
      <Typography variant="body2" color="text.primary">
        {t("storefront.status.unlocks", {
          subdomain,
          defaultValue:
            "On your org's own subdomain ({{subdomain}}): your theme and logo, page titles with your org's name, a market that only shows your org's listings, your own sidebar links, and an optional members-only mode. Your storefront on sc-market.space stays public either way.",
        })}
      </Typography>

      <Box sx={{ mt: 2 }}>
        {branding.custom_domain ? (
          <Typography variant="body2" color="text.primary">
            {t("storefront.status.domainLive", "Your subdomain:")}{" "}
            <MuiLink href={`https://${branding.custom_domain}`} target="_blank" rel="noopener">
              {branding.custom_domain}
            </MuiLink>
          </Typography>
        ) : (
          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2" color="text.primary">
              {t("storefront.status.domainOnRequest", "Staff set up the subdomain on request.")}
            </Typography>
            <EnquireBrandedStorefront />
          </Stack>
        )}
      </Box>
    </Paper>
  )
}
