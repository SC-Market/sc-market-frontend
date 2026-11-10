import { Avatar, Box, Grid, Typography } from "@mui/material"
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
import {
  CHANGELOG_PATHS,
  HELP_PATHS,
  LEGAL_PATHS,
  PATHS,
} from "../../routes/paths"
import { isOfficialSite, officialHelpUrl } from "../../features/help/links"
import { DEVELOPER_LINKS, DEVELOPERS_HEADING } from "./developerLinks"
import { useNow } from "../../util/format"
import { useCustomDomain } from "../../hooks/contractor/CustomDomain"
import scMarketLogo from "../../assets/scmarket-logo.webp"
import {
  FooterGroup,
  FooterLink,
  MEDIUM,
  NoticeLink,
  PHONE,
  useFooterColors,
} from "./FooterParts"

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
  const now = useNow()
  const [, , removeCookie] = useCookies([CONSENT_COOKIE])
  const theme = useTheme<ExtendedTheme>()
  const colors = useFooterColors(theme)
  // On an org's white-label domain the footer is the minimum (support, help,
  // report, legal, the notices): no SC Market structured data, brand block,
  // credit or referral code, nor links into SC Market's project pages, its
  // developer tools or SC Orgs.
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
      {/* The band: a solid surface under a top rule, like the navbar. Its
          border-image, outset sideways and down, carries the surface past
          the page container's padding to the edges of <main> (which clips
          it) and under the page's bottom padding. Outset paint is ink
          overflow, so it never adds a scrollbar. */}
      <Box
        component="footer"
        sx={{
          containerType: "inline-size",
          containerName: "sc-footer",
          backgroundColor: colors.band,
          borderImage: `linear-gradient(${theme.palette.divider} 0 1px, ${colors.band} 1px) fill 0 / 0 / 0 100vmax 100vmax`,
          color: "text.primary",
        }}
      >
        {/* One centred, max-width container on every page, whatever width
            the page layout around it uses (/market runs full-bleed). */}
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: 4,
            pt: 5.5,
            [PHONE]: { px: 2, pt: 4 },
          }}
        >
          {/* The brand and the link columns. Wide: the brand on the left and
              five columns sized to their content. Medium: three columns under
              the brand. Phones: two. */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isCustomDomain
                ? "repeat(2, max-content)"
                : "minmax(220px, 1fr) repeat(5, max-content)",
              columnGap: isCustomDomain ? 9 : 5.5,
              rowGap: 3.5,
              [MEDIUM]: isCustomDomain
                ? {}
                : { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
              [PHONE]: {
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                columnGap: 2.5,
              },
            }}
          >
            {!isCustomDomain && (
              <Box sx={{ minWidth: 0, [MEDIUM]: { gridColumn: "1 / -1" } }}>
                <Box
                  component={RouterLink}
                  to={PATHS.home}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.25,
                    color: "text.secondary",
                    textDecoration: "none",
                  }}
                >
                  {/* Decorative: the link's text says "SC Market". */}
                  <Avatar
                    src={scMarketLogo}
                    alt=""
                    variant="rounded"
                    sx={{ width: 36, height: 36 }}
                  />
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: theme.typography.fontFamilyHeading,
                      fontSize: "1.0625rem",
                      fontWeight: 600,
                    }}
                  >
                    SC Market
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    mt: 1.25,
                    fontSize: "0.875rem",
                    maxWidth: 280,
                    [MEDIUM]: { maxWidth: "none" },
                  }}
                >
                  {t(
                    "footer.tagline",
                    "The player-to-player marketplace for Star Citizen",
                  )}
                </Typography>
              </Box>
            )}

            <FooterGroup title={t("footer.groupHelp", "Help")} colors={colors}>
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
                <FooterGroup
                  title={t("footer.groupProject", "Project")}
                  colors={colors}
                >
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
                  colors={colors}
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
                <FooterGroup
                  title={t("footer.scOrgs", "SC Orgs")}
                  colors={colors}
                >
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

            <FooterGroup
              title={t("footer.groupLegal", "Legal")}
              colors={colors}
            >
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

          {/* The notices, in a muted bar under a rule: the copyright (and
              the referral code) on the left; the trademark and fansite
              notices, the official-site link and the credit on the right.
              The fansite notice and the official-site link always show
              (RSI's fansite rules). */}
          <Box
            sx={{
              mt: 5,
              borderTop: 1,
              borderColor: "divider",
              pt: 2.5,
              pb: 3.5,
              display: "grid",
              gridTemplateColumns: "260px minmax(0, 1fr)",
              columnGap: 5,
              rowGap: 1,
              fontSize: "0.78125rem",
              lineHeight: 1.55,
              color: colors.notice,
              "& p": { m: 0 },
              [PHONE]: { gridTemplateColumns: "minmax(0, 1fr)", mt: 3.5 },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Box
                component="p"
                sx={{ color: "text.primary", fontSize: "0.8125rem" }}
              >
                {t("footer.copyright", "Copyright © ")} SC Market{" "}
                {new Date(now).getUTCFullYear() + 930}.
              </Box>
              {!isCustomDomain && (
                <p>
                  {t("footer.referralCode", {
                    code: "STAR-GSFY-MQW9",
                  })}
                </p>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                maxWidth: 780,
              }}
            >
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
                {t("footer.officialSite", "Official Star Citizen site:")}{" "}
                <NoticeLink
                  href="https://robertsspaceindustries.com"
                  colors={colors}
                />
              </p>
              {!isCustomDomain && (
                <p>
                  <Trans
                    i18nKey="footer.acknowledgments"
                    components={{
                      ladyFleurLink: (
                        <NoticeLink
                          href="https://www.youtube.com/@robinerino"
                          label="LadyFleur"
                          colors={colors}
                        />
                      ),
                    }}
                  />
                </p>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}
