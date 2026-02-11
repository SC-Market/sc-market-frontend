import { useNavigate, useParams, Link } from "react-router-dom"
import React, { useCallback, useEffect } from "react"
import { Page } from "../../components/metadata/Page"
import {
  useAcceptContractorInviteCodeMutation,
  useGetContractorBySpectrumIDQuery,
  useGetContractorInviteCodeQuery,
} from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { Section } from "../../components/paper/Section"
import LoadingButton from "@mui/lab/LoadingButton"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { OrgDetails } from "../../components/list/UserDetails"
import { useTranslation } from "react-i18next"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import MaterialLink from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Grid2 from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded';
import AccountBoxRounded from '@mui/icons-material/AccountBoxRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Block from '@mui/icons-material/Block';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import HowToRegRounded from '@mui/icons-material/HowToRegRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ArrowBack from '@mui/icons-material/ArrowBack';

export function AcceptOrgInvite() {
  const { t } = useTranslation()
  const { invite_id } = useParams<{ invite_id: string }>()

  const issueAlert = useAlertHook()

  const { data: inviteDetails, isError } = useGetContractorInviteCodeQuery(
    invite_id || "",
  )
  useEffect(() => {
    if (isError) {
      navigate("/404")
    }
  }, [isError])

  const [acceptInvite, { isLoading }] = useAcceptContractorInviteCodeMutation()
  const navigate = useNavigate()

  const acceptCallback = useCallback(async () => {
    acceptInvite(invite_id || "")
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("org.invite.accepted"),
          severity: "success",
        })
        navigate("/")
      })
      .catch((error) => {
        issueAlert(error)
      })
  }, [acceptInvite, invite_id, issueAlert, navigate, t])

  const { data: contractor } = useGetContractorBySpectrumIDQuery(
    inviteDetails?.spectrum_id || "",
    { skip: !inviteDetails?.spectrum_id },
  )

  return (
    <Page title={t("org.invite.acceptInviteTitle")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <Section title={t("org.invite.acceptContractorInvite")}>
          <Grid item xs={12}>
            {t("org.invite.invitedMessage")}{" "}
            {contractor && <OrgDetails org={contractor} />}
          </Grid>

          <Grid item>
            <LoadingButton
              onClick={acceptCallback}
              loading={isLoading}
              variant={"contained"}
            >
              {t("org.invite.accept")}
            </LoadingButton>
          </Grid>
        </Section>
      </ContainerGrid>
    </Page>
  )
}
