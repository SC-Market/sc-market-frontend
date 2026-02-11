import { Section } from "../../components/paper/Section"
import React from "react"
import { Link } from "react-router-dom"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"

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
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';

export function MemberBalance() {
  const profile = useGetUserProfileQuery()
  const { t, i18n } = useTranslation()

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("MemberBalance.myBalance")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"h4"}
          align={"left"}
          color={"primary"}
          sx={{ fontWeight: "bold", transition: "0.3s" }}
        >
          {profile.data?.balance &&
            profile.data?.balance.toLocaleString(i18n.language)}{" "}
          aUEC
        </Typography>
      </Grid>
      <Grid item xs={12} container justifyContent={"space-between"}>
        <Link
          to={`/send`}
          style={{
            textDecoration: "none",
            color: "inherit",
            marginBottom: 2,
            marginRight: 2,
          }}
        >
          <Button color={"primary"} variant={"outlined"}>
            {t("MemberBalance.sendAUEC")}
          </Button>
        </Link>
        <Button color={"secondary"} variant={"outlined"}>
          {t("MemberBalance.withdraw")}
        </Button>
      </Grid>
    </Section>
  )
}
