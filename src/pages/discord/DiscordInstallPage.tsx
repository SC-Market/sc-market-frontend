import React, { useEffect, useRef } from "react"
import {
  Alert,
  Button,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useHead } from "@unhead/react"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { PageCard, PageCardActions } from "../../components/paper/PageCard"
import { useRecordDiscordInstallClickMutation } from "../../store/api/v2/market"
import {
  type DiscordInstallResult,
  type DiscordInstallSource,
  discordInstallPath,
  discordInstallStartUrl,
  installOwner,
  installResult,
  installSource,
  isInstallType,
} from "../../features/discord-install/installLinks"
import { PATHS } from "../../routes/paths"
import { useDiscordReachability } from "../../features/discord-install/DiscordUserInstallCta"

/** How long the click count may hold up the redirect. */
export const CLICK_WAIT_MS = 1000

/** Tests: replace the redirect. */
export const redirect = { to: (url: string) => window.location.replace(url) }

/** Where a signed-out user signs in to finish a user install: Settings › Notifications. */
const SIGN_IN_PATH = `${PATHS.login}?redirect=${encodeURIComponent("/settings?tab=notifications")}`

const RESULT_SEVERITY: Record<
  DiscordInstallResult,
  "success" | "info" | "warning" | "error"
> = {
  user_linked: "success",
  user_installed: "success",
  user_sign_in: "info",
  user_linked_elsewhere: "warning",
  user_other_discord: "warning",
  server_added: "success",
  server_sign_in: "info",
  server_forbidden: "error",
  cancelled: "info",
  failed: "error",
}

/**
 * Results that would say a user install lets the bot DM you. That isn't
 * confirmed (the backend's USER_INSTALL_COUNTS_AS_DM_REACHABLE, reported as
 * user_install_counts_as_dm); until it is, they say how to get DMs instead.
 */
const NO_DM_BODY: Partial<Record<DiscordInstallResult, string>> = {
  user_linked:
    "Your Discord account is now linked to SC Market. You can use SC Market commands anywhere in Discord. To get DMs about offers and orders, stay in a server with the bot for now.",
  user_installed:
    "You can use SC Market commands anywhere in Discord. To get DMs about offers and orders, stay in a server with the bot for now.",
}

/** Whether a user install counts as reachable by DM (false while signed out or unknown). */
function useInstallReachesDms(): boolean {
  return useDiscordReachability()?.user_install_counts_as_dm === true
}

/** The English text of each result (the keys are discordInstall.result.<result>.title/body). */
const RESULT_TEXT: Record<
  DiscordInstallResult,
  { title: string; body: string }
> = {
  user_linked: {
    title: "SC Market is on your Discord",
    body: "Your Discord account is now linked to SC Market, so we can reach you about offers and orders.",
  },
  user_installed: {
    title: "SC Market is on your Discord",
    body: "We can now reach you about offers and orders even if you're not in a shared server.",
  },
  user_sign_in: {
    title: "SC Market is on your Discord",
    body: "Sign in to SC Market, then add it again from Settings › Notifications to link your Discord account.",
  },
  user_linked_elsewhere: {
    title: "This Discord account is linked to another SC Market account",
    body: "We didn't link it to this account. Sign in with the account it belongs to, or add SC Market with a different Discord account.",
  },
  user_other_discord: {
    title: "Your SC Market account is linked to a different Discord account",
    body: "We didn't change it. To use this Discord account instead, unlink the current one in Settings › Discord Integration, then add SC Market again.",
  },
  server_added: {
    title: "The bot is in your server",
    body: "To get order threads and alerts there, add the bot again from your shop's or org's Discord settings, which links the server for you, or run /setup threads in a channel.",
  },
  server_sign_in: {
    title: "Sign in first",
    body: "Sign in to SC Market, then add the bot from your shop's or org's Discord settings.",
  },
  server_forbidden: {
    title: "You can't manage this Discord integration",
    body: "Linking a server needs Manage Market for a shop, or Manage Webhooks for an org. Nothing was linked; if the bot was added, it is in the server without a link.",
  },
  cancelled: {
    title: "Nothing was added",
    body: "You left Discord's page without adding SC Market.",
  },
  failed: {
    title: "We couldn't finish adding SC Market",
    body: "The link may have expired or already been used. Please start again.",
  },
}

function InstallResultView(props: {
  result: DiscordInstallResult
  src: DiscordInstallSource
}) {
  const { t } = useTranslation()
  const { result } = props
  const text = RESULT_TEXT[result]
  const reachesDms = useInstallReachesDms()
  const noDmBody = reachesDms ? undefined : NO_DM_BODY[result]
  const signIn = result === "user_sign_in" || result === "server_sign_in"
  const retry = result === "failed" || result === "cancelled"
  return (
    <PageCard
      title={t(`discordInstall.result.${result}.title`, text.title)}
      data-testid={`discord-install-result-${result}`}
    >
      <Alert severity={RESULT_SEVERITY[result]}>
        {noDmBody
          ? t(`discordInstall.result.${result}.bodyNoDm`, noDmBody)
          : t(`discordInstall.result.${result}.body`, text.body)}
      </Alert>
      {(signIn || retry) && (
        <PageCardActions>
          {signIn && (
            <Button variant="contained" href={SIGN_IN_PATH}>
              {t("discordInstall.result.signIn", "Sign in")}
            </Button>
          )}
          {retry && (
            <Button
              variant="outlined"
              href={`${PATHS.discordInstall}?src=${props.src}`}
            >
              {t("discordInstall.result.startAgain", "Start again")}
            </Button>
          )}
        </PageCardActions>
      )}
    </PageCard>
  )
}

/**
 * /discord/install?type=user|server&src=<surface>[&shop=<shop id>|&org=<Spectrum ID>]:
 * counts the click (POST /discord/install-clicks, per type and surface,
 * nothing about the visitor), then starts the backend's install flow, which
 * opens Discord. A normal SPA route, never a Pages Function. Without a valid
 * type it offers both choices; with ?result= it shows how an install ended.
 */
export function DiscordInstallPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const type = params.get("type")
  const src = installSource(params.get("src"))
  const owner = installOwner(params)
  const result = installResult(params.get("result"))
  const [recordClick] = useRecordDiscordInstallClickMutation()
  const started = useRef(false)
  const reachesDms = useInstallReachesDms()

  useHead({ meta: [{ name: "robots", content: "noindex" }] })

  const startUrl = isInstallType(type)
    ? discordInstallStartUrl(type, src, owner)
    : null

  useEffect(() => {
    if (result || !isInstallType(type) || !startUrl || started.current) return
    started.current = true
    const counted = recordClick({ discordInstallClickRequest: { type, src } })
      .unwrap()
      .catch(() => undefined)
    const timeout = new Promise((resolve) => setTimeout(resolve, CLICK_WAIT_MS))
    void Promise.race([counted, timeout]).then(() => redirect.to(startUrl))
  }, [result, type, src, startUrl, recordClick])

  const pageTitle = t("discordInstall.pageTitle", "Add SC Market to Discord")
  let body: React.ReactNode
  if (result) {
    body = <InstallResultView result={result} src={src} />
  } else if (startUrl) {
    body = (
      <PageCard title={pageTitle} data-testid="discord-install-opening">
        <Typography variant="body1" color="text.secondary">
          {t("discordInstall.opening", "Opening Discord…")}
        </Typography>
        <Typography variant="body2">
          {t("discordInstall.fallback", "If nothing happens,")}{" "}
          <MuiLink href={startUrl} rel="noopener noreferrer">
            {t("discordInstall.openManually", "open Discord's install page")}
          </MuiLink>
          .
        </Typography>
      </PageCard>
    )
  } else {
    body = (
      <PageCard title={pageTitle} data-testid="discord-install-choices">
        <Typography variant="body1">
          {t("discordInstall.choose", "How do you want to add SC Market?")}
        </Typography>
        <Stack spacing={0.75}>
          <Button variant="contained" href={discordInstallPath("user", src)}>
            {t("discordInstall.user", "To your Discord account")}
          </Button>
          <Typography variant="body2">
            {reachesDms
              ? t(
                  "discordInstall.userHint",
                  "So we can reach you about offers and orders even if you're not in a shared server.",
                )
              : t(
                  "discordInstall.userHintNoDm",
                  "So you can use SC Market commands anywhere in Discord.",
                )}
          </Typography>
        </Stack>
        <Stack spacing={0.75}>
          <Button variant="outlined" href={discordInstallPath("server", src)}>
            {t("discordInstall.server", "To a Discord server")}
          </Button>
          <Typography variant="body2">
            {t(
              "discordInstall.serverHint",
              "For order threads and alerts in your own server.",
            )}
          </Typography>
        </Stack>
      </PageCard>
    )
  }

  return (
    <StandardPageLayout title={pageTitle} maxWidth="sm">
      {body}
    </StandardPageLayout>
  )
}
