import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import EmailRoundedIcon from "@mui/icons-material/EmailRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { ContractorInvite } from "../../../datatypes/Contractor"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { Trans, useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import {
  useAcceptContractorInviteMutation,
  useDeclineContractorInviteMutation,
} from "../../../store/contractor"
import { useAlertHook } from "../../../hooks/alert/AlertHook"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import useTheme1 from '@mui/material/styles';
import MaterialLink from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';

export function NotificationContractorInvite(props: { notif: Notification }) {
  const theme = useTheme<ExtendedTheme>()
  const [open, setOpen] = useState(false)
  const { notif } = props
  const invite = useMemo(() => notif.entity as ContractorInvite, [notif.entity])
  const { t } = useTranslation()

  const [acceptInvite] = useAcceptContractorInviteMutation()
  const [declineInvite] = useDeclineContractorInviteMutation()

  const issueAlert = useAlertHook()

  async function submitInviteForm(
    choice: "accept" | "decline",
  ): Promise<boolean | void> {
    const funs = {
      accept: acceptInvite,
      decline: declineInvite,
    }

    funs[choice]({
      contractor: invite.spectrum_id,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("notifications.submitted"),
          severity: "success",
        })
      })
      .catch((err) => issueAlert(err))

    return false
  }

  return (
    <>
      <NotificationBase
        icon={<EmailRoundedIcon />}
        onClick={() => setOpen((o) => !o)}
        notif={notif}
      >
        <Trans
          i18nKey="notifications.contractor_invite_from"
          t={t}
          values={{ spectrum_id: invite.spectrum_id }}
          components={{
            contractorLink: (
              <Link
                to={`/contractor/${invite.spectrum_id}`}
                style={{
                  textDecoration: "none",
                  color: theme.palette.secondary.main,
                }}
              >
                <UnderlineLink>Placeholder</UnderlineLink>
              </Link>
            ),
          }}
        />
      </NotificationBase>
      <Collapse in={open}>
        <ListItem>
          <Box>{invite.message}</Box>

          <Button
            color={"success"}
            sx={{ marginRight: 1, marginLeft: 1 }}
            onClick={() => submitInviteForm("accept")}
          >
            {t("notifications.accept")}
          </Button>
          <Button color={"error"} onClick={() => submitInviteForm("decline")}>
            {t("notifications.decline")}
          </Button>
        </ListItem>
      </Collapse>
    </>
  )
}
