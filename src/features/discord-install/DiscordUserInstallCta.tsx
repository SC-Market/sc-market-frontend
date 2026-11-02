import React from "react"
import {
  Alert,
  Button,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useGetDiscordReachabilityQuery } from "../../store/api/v2/market"
import { useGetUserProfileQuery } from "../profile/api/profileApi"
import { FirstUseHint } from "../help/components/FirstUseHint"
import { discordInstallPath, type DiscordInstallSource } from "./installLinks"

/** Settings › Discord: where a Discord account is linked. */
export const LINK_DISCORD_PATH = "/settings?tab=discord"

/**
 * The signed-in user's Discord DM reachability (GET
 * /notification-preferences/discord-reachability), or undefined while
 * signed out or loading.
 */
export function useDiscordReachability() {
  const { data: profile } = useGetUserProfileQuery()
  const { data } = useGetDiscordReachabilityQuery(undefined, { skip: !profile })
  return profile ? data : undefined
}

/**
 * "Add SC Market to your Discord": installs the app on the user's own
 * Discord account (/discord/install?type=user), so the bot can DM them about
 * offers and orders without a shared server. Shown only to signed-in users,
 * only while the app can be user-installed, and not once they have.
 *
 * - "panel": Settings › Notifications (always, until installed);
 * - "unreachable": only when SC Market can't reach them by DM (the shop
 *   dashboard); asks them to link Discord first if they haven't;
 * - "hint": a dismissible first-use hint (the seller's shop pages).
 */
export function DiscordUserInstallCta(props: {
  src: DiscordInstallSource
  variant: "panel" | "unreachable" | "hint"
}) {
  const { t } = useTranslation()
  const reach = useDiscordReachability()
  if (!reach || !reach.user_install_available || reach.user_installed)
    return null
  if (props.variant === "unreachable" && reach.dm_reachable) return null

  const title = t("discordInstall.cta.title", "Add SC Market to your Discord")
  const why = t(
    "discordInstall.cta.why",
    "So we can reach you about offers and orders even if you're not in a shared server.",
  )
  const button = (
    <Button
      variant="contained"
      size="small"
      href={discordInstallPath("user", props.src)}
      data-testid="discord-user-install"
    >
      {title}
    </Button>
  )

  if (props.variant === "hint") {
    return (
      <FirstUseHint hint="discordUserInstall" title={title}>
        <Stack spacing={1} alignItems="flex-start">
          <span>{why}</span>
          {button}
        </Stack>
      </FirstUseHint>
    )
  }

  if (props.variant === "unreachable" && !reach.discord_linked) {
    return (
      <Alert severity="info" data-testid="discord-user-install-link-first">
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {t(
            "discordInstall.cta.unreachableTitle",
            "Buyers' offers can't reach you on Discord",
          )}
        </Typography>
        <Typography variant="body2">
          {t(
            "discordInstall.cta.linkFirst",
            "Link your Discord account first, then add SC Market to your Discord, so we can reach you about offers and orders even if you're not in a shared server.",
          )}{" "}
          <MuiLink component={Link} to={LINK_DISCORD_PATH}>
            {t("discordInstall.cta.linkDiscord", "Link Discord")}
          </MuiLink>
        </Typography>
      </Alert>
    )
  }

  return (
    <Alert
      severity="info"
      icon={false}
      action={button}
      data-testid={`discord-user-install-${props.variant}`}
    >
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {props.variant === "unreachable"
          ? t(
              "discordInstall.cta.unreachableTitle",
              "Buyers' offers can't reach you on Discord",
            )
          : title}
      </Typography>
      <Typography variant="body2">{why}</Typography>
    </Alert>
  )
}
