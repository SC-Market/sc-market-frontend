import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import EmailRoundedIcon from "@mui/icons-material/EmailRounded"
import { Box, Button, Collapse, ListItem } from "@mui/material"
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
