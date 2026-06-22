import { Avatar, Box, Button, Grid, Typography } from "@mui/material"
import { Section } from "../../components/paper/Section"
import React, { useCallback } from "react"
import { useParams } from "react-router-dom"
import {
  useProfileGetDiscordSettingsQuery,
  useProfileUseOfficialDiscordSettingsMutation,
} from "../../features/profile/api/profileApi"
import {
  useGetDiscordSettingsQuery,
  useUseOfficialDiscordSettingsMutation,
} from "../../features/contractor/api/contractorApi"
import { Stack } from "@mui/system"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { DISCORD_INVITE } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function ConfigureDiscord(props: { org?: boolean }) {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { data: userSettings } = useProfileGetDiscordSettingsQuery(undefined, {
    skip: !!props.org,
  })
  const { data: orgSettings } = useGetDiscordSettingsQuery(
    contractor_id ?? "",
    { skip: !props.org || !contractor_id },
  )

  const [setUseUserOfficial] = useProfileUseOfficialDiscordSettingsMutation()
  const [setUseContractorOfficial] = useUseOfficialDiscordSettingsMutation()

  const settings = props.org ? orgSettings : userSettings
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const callback = useCallback(async () => {
    if (props.org && contractor_id) {
      setUseContractorOfficial(contractor_id)
    } else {
      setUseUserOfficial()
    }
    window.open(DISCORD_INVITE, "_blank")
  }, [
    contractor_id,
    props.org,
    setUseContractorOfficial,
    setUseUserOfficial,
  ])

  return (
    <Section title={t("ConfigureDiscord.orderManagement")} xs={12}>
      <Grid item xs={12}>
        <Typography>{t("ConfigureDiscord.integratedChannel")}</Typography>
        <Stack
          direction={"row"}
          alignItems={"center"}
          spacing={theme.layoutSpacing.compact}
        >
          <Avatar src={settings?.guild_avatar} />
          <a
            href={`https://discord.com/channels/${
              settings?.official_server_id
            }/${settings?.discord_thread_channel_id || ""}`}
            target={"_blank"}
            rel="noreferrer"
          >
            <UnderlineLink color={"text.secondary"}>
              {settings?.guild_name ? (
                <>
                  {settings?.guild_name}: #{settings?.channel_name}
                </>
              ) : (
                t("ConfigureDiscord.notConfigured")
              )}
            </UnderlineLink>
          </a>
        </Stack>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography>
            {t("ConfigureDiscord.useOfficial1")}{" "}
            <a href={DISCORD_INVITE} target={"_blank"} rel="noreferrer">
              <UnderlineLink color={"primary"}>
                {t("ConfigureDiscord.serverName")}
              </UnderlineLink>
            </a>{" "}
            {t("ConfigureDiscord.useOfficial2")}
          </Typography>
          <Button color={"warning"} variant={"contained"} onClick={callback}>
            {t("ConfigureDiscord.useOfficialServer")}
          </Button>
        </Box>
      </Grid>
    </Section>
  )
}
