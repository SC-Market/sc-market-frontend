import { Section } from "../../components/paper/Section"
import React, { useCallback } from "react"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useProfileGetDiscordSettingsQuery,
  useProfileUseOfficialDiscordSettingsMutation,
} from "../../store/profile"
import {
  useGetDiscordSettingsQuery,
  useUseOfficialDiscordSettingsMutation,
} from "../../store/contractor"
import { Stack } from "@mui/system"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { DISCORD_INVITE } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';

export function ConfigureDiscord(props: { org?: boolean }) {
  const [currentOrg] = useCurrentOrg()
  const { data: userSettings } = useProfileGetDiscordSettingsQuery(undefined, {
    skip: !!props.org,
  })
  const { data: orgSettings } = useGetDiscordSettingsQuery(
    currentOrg?.spectrum_id ?? "",
    { skip: !props.org || !currentOrg?.spectrum_id },
  )

  const [setUseUserOfficial] = useProfileUseOfficialDiscordSettingsMutation()
  const [setUseContractorOfficial] = useUseOfficialDiscordSettingsMutation()

  const settings = props.org ? orgSettings : userSettings
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const callback = useCallback(async () => {
    if (props.org && currentOrg?.spectrum_id) {
      setUseContractorOfficial(currentOrg.spectrum_id)
    } else {
      setUseUserOfficial()
    }
    window.open(DISCORD_INVITE, "_blank")
  }, [
    currentOrg?.spectrum_id,
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
