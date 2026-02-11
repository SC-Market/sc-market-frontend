import { Section } from "../../components/paper/Section"
import React from "react"
import Checkbox from "@mui/material/Checkbox"
import { Discord } from "../../components/icon/DiscordIcon"
import { useTranslation } from "react-i18next"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/MenuProps';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';

export function Authenticate(props: {}) {
  const { t } = useTranslation()

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("auth.title")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.email")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.username")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.password")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label={t("auth.repeatPassword")} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12} alignItems={"center"} container>
        <Typography display={"inline"}>{t("auth.loginWith")}</Typography>
        <ButtonGroup
          variant="outlined"
          aria-label={t("auth.aria.outlinedGroup")}
        >
          <IconButton color={"primary"}>
            <Google />
          </IconButton>
          <IconButton color={"primary"}>
            <Discord />
          </IconButton>
        </ButtonGroup>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={8}>
        <Typography>
          <Checkbox />
          {t("auth.terms")}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Button variant={"outlined"}>{t("auth.submit")}</Button>
      </Grid>
    </Section>
  )
}
