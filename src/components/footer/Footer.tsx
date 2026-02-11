import { UnderlineLink } from "../typography/UnderlineLink"
import React from "react"
import { DISCORD_INVITE } from "../../util/constants"
import { Trans, useTranslation } from "react-i18next"
import { ReportButton } from "../button/ReportButton"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import useTheme1 from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';

export function Footer() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} sx={{ marginTop: 2 }}>
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
