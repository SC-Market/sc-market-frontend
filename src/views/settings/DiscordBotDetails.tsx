import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FAQQuestion } from "../../components/landing"
import { DISCORD_INVITE } from "../../util/constants"
import { useTranslation } from "react-i18next"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CreateRounded from '@mui/icons-material/CreateRounded';

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
      </Grid>
      <Grid item xs={12} lg={8} md={8}>
        <List
          sx={{
            borderRadius: theme.spacing(2),
            backgroundColor: "#000000A0",
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
