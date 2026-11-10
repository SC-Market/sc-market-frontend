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

/** An off-site link in the notices; `label` names it for screen readers. */
function CreditLink(props: { href: string; label?: string }) {
  return (
    <Link
      rel="noopener noreferrer"
      target="_blank"
      href={props.href}
      aria-label={props.label}
    >
      <UnderlineLink component="span" color="text.primary" variant="body2">
        {props.label ?? new URL(props.href).hostname}
      </UnderlineLink>
    </Link>
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
        {/* One centred, max-width container on every page, whatever width
            the page layout around it uses (/market runs full-bleed). Its side
            padding also keeps the text off the screen edge on phones.
            Stacked below lg; from lg the link columns sit on the left and the
            notices take the rest of the row on the right. */}
        <Grid item xs={12}>
          <Box
            sx={{
              maxWidth: 1200,
              mx: "auto",
              px: { xs: 2, sm: 3 },
              pb: { xs: 3, lg: 4 },
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: { lg: "flex-start" },
              gap: { xs: 2.5, lg: 6 },
            }}
          >
            {/* Columns sized to their content, not stretched. */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(3, minmax(0, max-content))",
                  md: "repeat(5, minmax(0, max-content))",
                },
                flex: { lg: "0 1 auto" },
                // Centred over the centred notices while stacked.
                justifyContent: { sm: "center", lg: "start" },
                minWidth: 0,
                columnGap: { xs: 3, md: 4 },
                rowGap: 2.5,
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
            <Divider light sx={{ display: { lg: "none" } }} />
            <Divider
              light
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", lg: "block" } }}
            />
            {/* The notices: one short paragraph each, so they stay readable
              in the narrower right-hand column. */}
            <Typography
              component="div"
              variant="body2"
              color="textSecondary"
              sx={{
                flex: { lg: "1 1 0" },
                minWidth: { lg: 300 },
                maxWidth: { xs: 720, lg: "none" },
                mx: { xs: "auto", lg: 0 },
                display: "flex",
                flexDirection: "column",
                gap: 1,
                textAlign: { xs: "center", lg: "left" },
                "& p": { m: 0 },
              }}
            >
              <p>
                {t("footer.copyright", "Copyright © ")} SC Market{" "}
                {new Date(now).getUTCFullYear() + 930}.
              </p>
              <p>
                {t(
                  "footer.trademark",
                  "Star Citizen®, Squadron 42®, Roberts Space Industries®, and Cloud Imperium® are registered trademarks of Cloud Imperium Rights LLC",
                )}
              </p>
              <p>
                {t(
                  "footer.unofficial",
                  "This is an unofficial Star Citizen fansite, not affiliated with the Cloud Imperium group of companies. All content on this site not authored by its host or users is property of their respective owners",
                )}
              </p>
              <p>
                {/* RSI's fansite rules: the notice plus a link to the official site. */}
                {t("footer.officialSite", "Official Star Citizen site:")}{" "}
                <CreditLink href="https://robertsspaceindustries.com" />
              </p>
              {!isCustomDomain && (
                <>
                  <p>
                    <Trans
                      i18nKey="footer.acknowledgments"
                      components={{
                        ladyFleurLink: (
                          <CreditLink
                            href="https://www.youtube.com/@robinerino"
                            label="LadyFleur"
                          />
                        ),
                      }}
                    />
                  </p>
                  <p>
                    {t("footer.referralCode", {
                      code: "STAR-GSFY-MQW9",
                    })}
                  </p>
                </>
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  )
}
