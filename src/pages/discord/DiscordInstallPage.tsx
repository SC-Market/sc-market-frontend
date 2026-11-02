import React, { useEffect, useRef } from "react"
import { Button, Link as MuiLink, Stack, Typography } from "@mui/material"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useHead } from "@unhead/react"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useRecordDiscordInstallClickMutation } from "../../store/api/v2/market"
import {
  discordAuthorizeUrl,
  discordInstallPath,
  installSource,
  isInstallType,
} from "../../features/discord-install/installLinks"

/** How long the click count may hold up the redirect. */
export const CLICK_WAIT_MS = 1000

/** Tests: replace the redirect. */
export const redirect = { to: (url: string) => window.location.replace(url) }

/**
 * /discord/install?type=user|server&src=<surface>: counts the click
 * (POST /discord/install-clicks, per type and surface, nothing about the
 * visitor), then opens Discord's install page. A normal SPA route, never a
 * Pages Function. Without a valid type it offers both choices.
 */
export function DiscordInstallPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const type = params.get("type")
  const src = installSource(params.get("src"))
  const [recordClick] = useRecordDiscordInstallClickMutation()
  const started = useRef(false)

  useHead({ meta: [{ name: "robots", content: "noindex" }] })

  useEffect(() => {
    if (!isInstallType(type) || started.current) return
    started.current = true
    const url = discordAuthorizeUrl(type)
    const counted = recordClick({ discordInstallClickRequest: { type, src } })
      .unwrap()
      .catch(() => undefined)
    const timeout = new Promise((resolve) => setTimeout(resolve, CLICK_WAIT_MS))
    void Promise.race([counted, timeout]).then(() => redirect.to(url))
  }, [type, src, recordClick])

  return (
    <StandardPageLayout
      title={t("discordInstall.pageTitle", "Add SC Market to Discord")}
      maxWidth="sm"
      noSidebar={true}
    >
      {isInstallType(type) ? (
        <Stack spacing={1} data-testid="discord-install-opening">
          <Typography variant="body1" color="text.secondary">
            {t("discordInstall.opening", "Opening Discord…")}
          </Typography>
          <Typography variant="body2" color="text.primary">
            {t("discordInstall.fallback", "If nothing happens,")}{" "}
            <MuiLink href={discordAuthorizeUrl(type)} rel="noopener noreferrer">
              {t("discordInstall.openManually", "open Discord's install page")}
            </MuiLink>
            .
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={2} data-testid="discord-install-choices">
          <Typography variant="body1" color="text.primary">
            {t("discordInstall.choose", "How do you want to add SC Market?")}
          </Typography>
          <Button variant="contained" href={discordInstallPath("user", src)}>
            {t("discordInstall.user", "To your Discord account")}
          </Button>
          <Typography variant="body2" color="text.primary">
            {t(
              "discordInstall.userHint",
              "So we can reach you about offers and orders even if you're not in a shared server.",
            )}
          </Typography>
          <Button variant="outlined" href={discordInstallPath("server", src)}>
            {t("discordInstall.server", "To a Discord server")}
          </Button>
          <Typography variant="body2" color="text.primary">
            {t(
              "discordInstall.serverHint",
              "For order threads and alerts in your own server.",
            )}
          </Typography>
        </Stack>
      )}
    </StandardPageLayout>
  )
}
