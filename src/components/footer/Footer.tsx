import { UnderlineLink } from "../typography/UnderlineLink"
import { Divider, Grid, Link, Typography } from "@mui/material"
import React from "react"
import { useCookies } from "react-cookie"
import { CONSENT_COOKIE } from "../../util/consent/analyticsConsent"
import { DISCORD_INVITE } from "../../util/constants"
import { discordInstallPath } from "../../features/discord-install/installLinks"
import { Trans, useTranslation } from "react-i18next"
import { ReportButton } from "../button/ReportButton"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Helmet } from "@unhead/react/helmet"
import { serializeJsonLd } from "../../seo/pageHead"
import { siteJsonLd } from "../../seo/siteHeads"
import { Link as RouterLink } from "react-router-dom"
import { CHANGELOG_PATHS, HELP_PATHS, LEGAL_PATHS } from "../../routes/paths"
import { isOfficialSite, officialHelpUrl } from "../../features/help/links"
import { DEVELOPER_LINKS, DEVELOPERS_HEADING } from "./developerLinks"

/** SC Orgs pages linked from the footer (sc-orgs.space's sitemap). */
export const SC_ORGS_LINKS = [
  {
    href: "https://sc-orgs.space/communities",
    key: "chromeUi.scOrgsLinks.communities",
    label: "Org directory",
  },
  {
    href: "https://sc-orgs.space/lfo",
    key: "chromeUi.scOrgsLinks.lfo",
    label: "Looking for an org",
  },
  {
    href: "https://sc-orgs.space/events",
    key: "chromeUi.scOrgsLinks.events",
    label: "Org events",
  },
  {
    href: "https://sc-orgs.space/guides/register-your-org",
    key: "chromeUi.scOrgsLinks.register",
    label: "Register your org",
  },
  {
    href: "https://sc-orgs.space/guides/join-an-org",
    key: "chromeUi.scOrgsLinks.join",
    label: "Join an org",
  },
] as const

export function Footer() {
  const { t } = useTranslation()
  const [, , removeCookie] = useCookies([CONSENT_COOKIE])
  const theme = useTheme<ExtendedTheme>()
  // Help pages render only on the official site; white-label domains link out.
  const helpLink = (path: string) =>
    isOfficialSite()
      ? { component: RouterLink, to: path }
      : { href: officialHelpUrl(path), target: "_blank", rel: "noopener" }
  // Developer links: guides route in the SPA; /developers is a static page
  // (public/developers.html) and the rest are off-site.
  const developerLink = (href: string) =>
    href.startsWith("https://")
      ? { href, target: "_blank", rel: "noopener" }
      : href.startsWith("/guides")
        ? helpLink(href)
        : { href: isOfficialSite() ? href : officialHelpUrl(href) }

  return (
    <Grid item xs={12} sx={{ marginTop: 2 }}>
      <Helmet>
        {/*
          Site-wide structured data (Organization + WebSite with the sitelinks
          SearchAction). The Footer renders on every page, so this is the
          single global injection point; the edge bridge emits the same nodes
          for "/" (src/seo/siteHeads.ts).
        */}
        <script type="application/ld+json">
          {serializeJsonLd(siteJsonLd())}
        </script>
      </Helmet>
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
        <Grid item xs={12}>
          <Typography
            component="div"
            variant="body2"
            color="text.primary"
            align="center"
          >
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={DISCORD_INVITE}
              aria-label={t("footer.support", "Support")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.support", "Support")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={DISCORD_INVITE}
              aria-label={t("footer.discord", "Discord")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.discord", "Discord")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={discordInstallPath("server", "footer")}
              aria-label={t("footer.discordBot", "Discord Bot")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.discordBot", "Discord Bot")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link {...helpLink(HELP_PATHS.hub)}>
              <UnderlineLink color={"text.secondary"}>
                {t("footer.helpGuides", "Help & Guides")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link {...helpLink(HELP_PATHS.about)}>
              <UnderlineLink color={"text.secondary"}>
                {t("footer.about", "About")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link {...helpLink(CHANGELOG_PATHS.index)}>
              <UnderlineLink color={"text.secondary"}>
                {t("footer.changelog", "Changelog")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"https://www.patreon.com/henry232323"}
              aria-label={t("footer.donate", "Donate")}
            >
              <UnderlineLink color={"primary"}>
                {t("footer.donate", "Donate")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"https://github.com/SC-Market"}
              aria-label={t("footer.github", "Github")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.github", "Github")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            {/* nofollow: on every page, these boilerplate links outnumbered
                every content link in Search Console's internal links. */}
            <Link
              rel="nofollow noopener noreferrer"
              target="_blank"
              href={LEGAL_PATHS.privacy}
              aria-label={t("footer.privacyPolicy", "Privacy Policy")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.privacyPolicy", "Privacy Policy")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="nofollow noopener noreferrer"
              target="_blank"
              href={LEGAL_PATHS.terms}
              aria-label={t("footer.termsOfService", "Terms of Service")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.termsOfService", "Terms of Service")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            {/* Reopens the cookie bar (it shows while no choice is stored) */}
            <Link
              component="button"
              type="button"
              onClick={() => removeCookie(CONSENT_COOKIE, { path: "/" })}
              sx={{ verticalAlign: "baseline", font: "inherit" }}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.cookiePreferences", "Cookie preferences")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"https://api.sc-market.space/docs"}
              aria-label={t("footer.apiDocs", "API Docs")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.apiDocs", "API Docs")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            {/* Developers: the public API, its spec, the price feed and the SDK (also in the bridge HTML). */}
            <Typography component="span" variant="body2" color="text.secondary">
              {t(DEVELOPERS_HEADING.key, DEVELOPERS_HEADING.label)}:
            </Typography>
            {DEVELOPER_LINKS.map((link, i) => (
              <React.Fragment key={link.href}>
                {i === 0 ? " " : <>&nbsp;·&nbsp;</>}
                <Link {...developerLink(link.href)}>
                  <UnderlineLink color={"text.secondary"}>
                    {t(link.key, link.label)}
                  </UnderlineLink>
                </Link>
              </React.Fragment>
            ))}
            &nbsp;|&nbsp;
            <Link
              rel="noopener"
              target="_blank"
              href={"https://sc-orgs.space"}
              aria-label={t("footer.scOrgs", "SC Orgs")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.scOrgs", "SC Orgs")}
              </UnderlineLink>
            </Link>
            {/* Deep links into SC Orgs (our sister site), not just its homepage. */}
            {SC_ORGS_LINKS.map((link) => (
              <React.Fragment key={link.href}>
                &nbsp;·&nbsp;
                <Link rel="noopener" target="_blank" href={link.href}>
                  <UnderlineLink color={"text.secondary"}>
                    {t(link.key, link.label)}
                  </UnderlineLink>
                </Link>
              </React.Fragment>
            ))}
            &nbsp;|&nbsp;
            <ReportButton />
          </Typography>
          <br />
          <Typography
            component="div"
            variant="body2"
            color="textSecondary"
            align="center"
          >
            {t("footer.copyright", "Copyright © ")} SC Market{" "}
            {new Date().getFullYear() + 930}.
            <br />
            {t(
              "footer.trademark",
              "Star Citizen®, Squadron 42®, Roberts Space Industries®, and Cloud Imperium® are registered trademarks of Cloud Imperium Rights LLC",
            )}
            <br />
            {t(
              "footer.unofficial",
              "This is an unofficial Star Citizen fansite, not affiliated with the Cloud Imperium group of companies. All content on this site not authored by its host or users are property of their respective owners",
            )}
            <br />
            {/* RSI's fansite rules: the notice plus a link to the official site. */}
            {t("footer.officialSite", "Official Star Citizen site:")}{" "}
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href="https://robertsspaceindustries.com"
            >
              <UnderlineLink
                component="span"
                color="text.primary"
                variant="body2"
              >
                robertsspaceindustries.com
              </UnderlineLink>
            </Link>
            <br />
            <Trans
              i18nKey="footer.acknowledgments"
              components={{
                ladyFleurLink: (
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.youtube.com/@robinerino"
                    aria-label="LadyFleur"
                  >
                    <UnderlineLink
                      component="span"
                      color="text.primary"
                      variant="body2"
                    >
                      LadyFleur
                    </UnderlineLink>
                  </Link>
                ),
                starCitizenApiLink: (
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://starcitizen-api.com/"
                    aria-label="StarCitizen-API"
                  >
                    <UnderlineLink
                      component="span"
                      color="text.primary"
                      variant="body2"
                    >
                      StarCitizen-API
                    </UnderlineLink>
                  </Link>
                ),
                nexdLink: (
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://nexd.to/"
                    aria-label="NEXD"
                  >
                    <UnderlineLink
                      component="span"
                      color="text.primary"
                      variant="body2"
                    >
                      NEXD
                    </UnderlineLink>
                  </Link>
                ),
                starCitizenWikiLink: (
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://starcitizen.tools/"
                    aria-label="Star Citizen Wiki"
                  >
                    <UnderlineLink
                      component="span"
                      color="text.primary"
                      variant="body2"
                    >
                      Star Citizen Wiki
                    </UnderlineLink>
                  </Link>
                ),
              }}
            />
            <br />
            {t("footer.referralCode", {
              code: "STAR-GSFY-MQW9",
            })}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}
