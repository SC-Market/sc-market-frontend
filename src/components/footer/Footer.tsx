import { UnderlineLink } from "../typography/UnderlineLink"
import { Divider, Grid, Link, Typography } from "@mui/material"
import React from "react"
import { DISCORD_INVITE } from "../../util/constants"
import { useTranslation } from "react-i18next"

export function Footer() {
  const { t } = useTranslation()

  return (
    <Grid item xs={12} sx={{ marginTop: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.primary" align="center">
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
              href={
                "https://discord.com/oauth2/authorize?client_id=868709691469987860&permissions=361314126849&integration_type=0&scope=bot"
              }
              aria-label={t("footer.discordBot", "Discord Bot")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.discordBot", "Discord Bot")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"https://github.com/henry232323/sc-market/wiki"}
              aria-label={t("footer.wiki", "Wiki")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.wiki", "Wiki")}
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
              href={"https://github.com/henry232323/sc-market"}
              aria-label={t("footer.github", "Github")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.github", "Github")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"/privacy-policy"}
              aria-label={t("footer.privacyPolicy", "Privacy Policy")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.privacyPolicy", "Privacy Policy")}
              </UnderlineLink>
            </Link>
            &nbsp;|&nbsp;
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"/terms-of-service"}
              aria-label={t("footer.termsOfService", "Terms of Service")}
            >
              <UnderlineLink color={"text.secondary"}>
                {t("footer.termsOfService", "Terms of Service")}
              </UnderlineLink>
            </Link>
          </Typography>
          <br />
          <Typography variant="body2" color="textSecondary" align="center">
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
            {t("footer.thanksTo", "Thank you to")}{" "}
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"https://www.youtube.com/@robinerino"}
              aria-label={t("footer.ladyFleur", "LadyFleur")}
            >
              <UnderlineLink color={"text.primary"} variant="body2">
                {t("footer.ladyFleur", "LadyFleur")}
              </UnderlineLink>
            </Link>{" "}
            {t("footer.forLogo", "for the site logo, and to")}{" "}
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"https://starcitizen-api.com/"}
              aria-label={t("footer.starCitizenApi", "StarCitizen-API")}
            >
              <UnderlineLink color={"text.primary"} variant="body2">
                {t("footer.starCitizenApi", "StarCitizen-API")}
              </UnderlineLink>
            </Link>
            ,{" "}
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"https://nexd.to/ "}
              aria-label={t("footer.nexd", "NEXD")}
            >
              <UnderlineLink color={"text.primary"} variant="body2">
                {t("footer.nexd", "NEXD")}
              </UnderlineLink>
            </Link>
            , {t("footer.and", "and")}{" "}
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={"https://starcitizen.tools/"}
              aria-label={t("footer.starCitizenWiki", "Star Citizen Wiki")}
            >
              <UnderlineLink color={"text.primary"} variant="body2">
                {t("footer.starCitizenWiki", "Star Citizen Wiki")}
              </UnderlineLink>
            </Link>{" "}
            {t("footer.forTheirApis", "for their APIs.")}
            <br />
            {t("footer.referralCode", "Use our referral code:")} STAR-GSFY-MQW9
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}
