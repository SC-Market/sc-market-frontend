import { useMemo } from "react"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import CancelRoundedIcon from "@mui/icons-material/CancelRounded"
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded"
import { useTranslation } from "react-i18next"
import { Notification } from "../../../hooks/login/UserProfile"
import { NotificationBase } from "../components/NotificationBase"
import { ORDER_PATHS } from "../../../routes/paths"

/**
 * Offer sessions: your offer was accepted or rejected, or someone made an
 * offer on your public contract.
 */
export function NotificationOfferDecision(props: { notif: Notification }) {
  const { notif } = props
  const { t } = useTranslation()
  const session = useMemo(
    () => notif.entity as unknown as { id?: string; session_id?: string },
    [notif.entity],
  )
  const sessionId = session.session_id || session.id
  const actor = notif.actors?.[0]
  const who =
    actor?.display_name ||
    actor?.username ||
    t("notifications.someone", "Someone")
  const [icon, text] =
    notif.action === "offer_accepted"
      ? [
          <CheckCircleRoundedIcon key="i" />,
          t("notifications.offer_accepted", {
            defaultValue: "{{who}} accepted your offer",
            who,
          }),
        ]
      : notif.action === "offer_rejected"
        ? [
            <CancelRoundedIcon key="i" />,
            t("notifications.offer_rejected", {
              defaultValue: "{{who}} rejected your offer",
              who,
            }),
          ]
        : [
            <LocalOfferRoundedIcon key="i" />,
            t("notifications.contract_offer_received", {
              defaultValue: "{{who}} made an offer on your contract",
              who,
            }),
          ]
  return (
    <NotificationBase
      icon={icon}
      to={sessionId ? ORDER_PATHS.offer(sessionId) : undefined}
      notif={notif}
    >
      {text}
    </NotificationBase>
  )
}
