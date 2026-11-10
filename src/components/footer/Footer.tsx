import { UnderlineLink } from "../typography/UnderlineLink"
import { Box, Divider, Grid, Link, LinkProps, Typography } from "@mui/material"
import React, { useId } from "react"
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
import { useNow } from "../../util/format"
import { useCustomDomain } from "../../hooks/contractor/CustomDomain"

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

/** One footer column: a labelled nav landmark with a heading and a link list. */
function FooterGroup(props: { title: string; children: React.ReactNode }) {
  const id = useId()
  return (
    <Box component="nav" aria-labelledby={id}>
      <Typography
        id={id}
        component="h2"
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontWeight: 600, mb: 1 }}
      >
        {props.title}
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          typography: "body2",
          // Links, and the Report button that inherits its colour.
          color: "text.accent",
        }}
      >
        {props.children}
      </Box>
    </Box>
  )
}

/** A footer list item: an accent link with the site's hover underline. */
function FooterLink({
  children,
  ...props
}: LinkProps & {
  /** RouterLink or "button"; `to` goes with RouterLink. */
  component?: React.ElementType
  to?: string
  type?: "button"
}) {
  return (
    <li>
      <Link color="inherit" underline="none" {...props}>
        <UnderlineLink component="span">{children}</UnderlineLink>
      </Link>
    </li>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const now = useNow()
  const [, , removeCookie] = useCookies([CONSENT_COOKIE])
  const theme = useTheme<ExtendedTheme>()
  // On an org's white-label domain the footer is the minimum (support, help,
  // report, legal, the notices): no SC Market structured data, nor links into
  // SC Market's project pages, its developer tools or SC Orgs.
  const { isCustomDomain } = useCustomDomain()
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
      {!isCustomDomain && (
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
      )}
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
        {/* Side padding on phones: some page layouts run the footer to the
            screen edge (or a few px past it) below sm. */}
        <Grid item xs={12} sx={{ "& > *": { px: { xs: 2, sm: 0 } } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(5, minmax(0, 1fr))",
              },
              columnGap: 4,
              rowGap: 3,
            }}
          >
            <FooterGroup title={t("footer.groupHelp", "Help")}>
              <FooterLink
                rel="noopener noreferrer"
                target="_blank"
                href={DISCORD_INVITE}
              >
                {t("footer.support", "Support")}
              </FooterLink>
              <FooterLink {...helpLink(HELP_PATHS.hub)}>
                {t("footer.helpGuides", "Help & Guides")}
              </FooterLink>
              {!isCustomDomain && (
                <>
                  <FooterLink
                    rel="noopener noreferrer"
                    target="_blank"
                    href={DISCORD_INVITE}
                  >
                    {t("footer.discord", "Discord")}
                  </FooterLink>
                  <FooterLink
                    rel="noopener noreferrer"
                    target="_blank"
                    href={discordInstallPath("server", "footer")}
                  >
                    {t("footer.discordBot", "Discord Bot")}
                  </FooterLink>
                </>
              )}
              <li>
                <ReportButton />
              </li>
            </FooterGroup>

            {!isCustomDomain && (
              <>
                <FooterGroup title={t("footer.groupProject", "Project")}>
                  <FooterLink {...helpLink(HELP_PATHS.about)}>
                    {t("footer.about", "About")}
                  </FooterLink>
                  <FooterLink {...helpLink(CHANGELOG_PATHS.index)}>
                    {t("footer.changelog", "Changelog")}
                  </FooterLink>
                  <FooterLink
                    rel="noopener noreferrer"
                    target="_blank"
                    href={"https://www.patreon.com/henry232323"}
                  >
                    {t("footer.donate", "Donate")}
                  </FooterLink>
                  <FooterLink
                    rel="noopener noreferrer"
                    target="_blank"
                    href={"https://github.com/SC-Market"}
                  >
                    {t("footer.github", "Github")}
                  </FooterLink>
                </FooterGroup>

                {/* Developers: the public API, its spec, the price feed and the SDK (also in the bridge HTML). */}
                <FooterGroup
                  title={t(DEVELOPERS_HEADING.key, DEVELOPERS_HEADING.label)}
                >
                  <FooterLink
                    rel="noopener noreferrer"
                    target="_blank"
                    href={"https://api.sc-market.space/docs"}
                  >
                    {t("footer.apiDocs", "API Docs")}
                  </FooterLink>
                  {DEVELOPER_LINKS.map((link) => (
                    <FooterLink key={link.href} {...developerLink(link.href)}>
                      {t(link.key, link.label)}
                    </FooterLink>
                  ))}
                </FooterGroup>

                {/* Deep links into SC Orgs (our sister site), not just its homepage. */}
                <FooterGroup title={t("footer.scOrgs", "SC Orgs")}>
                  <FooterLink
                    rel="noopener"
                    target="_blank"
                    href={"https://sc-orgs.space"}
                  >
                    {t("footer.scOrgsHome", "Visit SC Orgs")}
                  </FooterLink>
                  {SC_ORGS_LINKS.map((link) => (
                    <FooterLink
                      key={link.href}
                      rel="noopener"
                      target="_blank"
                      href={link.href}
                    >
                      {t(link.key, link.label)}
                    </FooterLink>
                  ))}
                </FooterGroup>
              </>
            )}

            <FooterGroup title={t("footer.groupLegal", "Legal")}>
              {/* nofollow: on every page, these boilerplate links outnumbered
                  every content link in Search Console's internal links. */}
              <FooterLink
                rel="nofollow noopener noreferrer"
                target="_blank"
                href={LEGAL_PATHS.privacy}
              >
                {t("footer.privacyPolicy", "Privacy Policy")}
              </FooterLink>
              <FooterLink
                rel="nofollow noopener noreferrer"
                target="_blank"
                href={LEGAL_PATHS.terms}
              >
                {t("footer.termsOfService", "Terms of Service")}
              </FooterLink>
              {/* Reopens the cookie bar (it shows while no choice is stored) */}
              <FooterLink
                component="button"
                type="button"
                onClick={() => removeCookie(CONSENT_COOKIE, { path: "/" })}
                sx={{ font: "inherit", textAlign: "left" }}
              >
                {t("footer.cookiePreferences", "Cookie preferences")}
              </FooterLink>
            </FooterGroup>
          </Box>
          <Divider light sx={{ my: 3 }} />
          <Typography
            component="div"
            variant="body2"
            color="textSecondary"
            align="center"
          >
            {t("footer.copyright", "Copyright © ")} SC Market{" "}
            {new Date(now).getUTCFullYear() + 930}.
            <br />
            {t(
              "footer.trademark",
              "Star Citizen®, Squadron 42®, Roberts Space Industries®, and Cloud Imperium® are registered trademarks of Cloud Imperium Rights LLC",
            )}
            <br />
            {t(
              "footer.unofficial",
              "This is an unofficial Star Citizen fansite, not affiliated with the Cloud Imperium group of companies. All content on this site not authored by its host or users is property of their respective owners",
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
            {!isCustomDomain && (
              <>
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
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}
