import React from "react"
import { Grid, List, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FAQQuestion } from "../../components/landing/FAQQuestion"
import { DISCORD_INVITE } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { HelpLink } from "../../features/help/components/HelpLink"

export function DiscordBotDetails(props: { org?: boolean }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <>
      <Grid item xs={12} lg={4} md={4}>
        <Typography
          variant={"h3"}
          color={"text.secondary"}
          sx={{ maxWidth: 400 }}
        >
          {t("discord_bot.integrating_with_discord")}
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          <HelpLink guide="connectDiscordBot">
            {t("discord_bot.learn_connect", "Connect the Discord bot")}
          </HelpLink>
          <HelpLink guide="orderAlerts">
            {t("discord_bot.learn_alerts", "Order alerts and claiming")}
          </HelpLink>
        </Stack>
      </Grid>
      <Grid item xs={12} lg={8} md={8}>
        <List
          component="div"
          sx={{
            borderRadius: theme.spacing(2),
            backgroundColor: theme.palette.background.overlay,
            padding: 0,
          }}
        >
          <FAQQuestion
            question={t("discord_bot.how_to_get_notified")}
            answer={t("discord_bot.how_to_get_notified_answer", {
              DISCORD_INVITE,
            })}
            first
          />
          <FAQQuestion
            question={t("discord_bot.how_to_communicate")}
            answer={t("discord_bot.how_to_communicate_answer")}
            last
          />
        </List>
      </Grid>
      {/*<Grid item xs={12}>*/}
      {/*    <Button variant={'outlined'} sx={{width: '100%'}} startIcon={<SendRounded/>}>*/}
      {/*        Test Discord Integration*/}
      {/*    </Button>*/}
      {/*</Grid>*/}
    </>
  )
}
