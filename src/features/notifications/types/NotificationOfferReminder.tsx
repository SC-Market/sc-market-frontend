import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded"
import { useTranslation } from "react-i18next"
import { Notification } from "../../../hooks/login/UserProfile"
import { NotificationBase } from "../components/NotificationBase"
import { ORDER_PATHS } from "../../../routes/paths"

/**
 * Entity of a pending-offer reminder (backend services/offer-reminders
 * offerReminderEntity): the offers in one reminder, entity id = its batch.
 * stage first / final: to the seller side; buyer: to the customer.
 */
export interface OfferReminderNotice {
  batch_id: string
  stage: "first" | "final" | "buyer"
  offers: {
    session_id: string
    title: string
    offer_at: string | null
    open: boolean
  }[]
}

export function isOfferReminderNotice(
  entity: Notification["entity"] | undefined,
): entity is OfferReminderNotice {
  return (
    !!entity &&
    typeof entity === "object" &&
    "batch_id" in entity &&
    "stage" in entity &&
    Array.isArray((entity as { offers?: unknown }).offers)
  )
}

/** "An offer is waiting for your reply" (seller) / "still waiting for the seller" (buyer). */
export function NotificationOfferReminder(props: { notif: Notification }) {
  const { notif } = props
  const { t } = useTranslation()
  const notice = isOfferReminderNotice(notif.entity) ? notif.entity : null
  if (!notice || !notice.offers.length) return null
  const n = notice.offers.length
  const title = notice.offers[0].title
  const target = notice.offers.find((o) => o.open) ?? notice.offers[0]

  const text =
    notice.stage === "buyer"
      ? n === 1
        ? t("notifications.offer_reminder.buyer_one", {
            defaultValue:
              '"{{title}}" is still waiting for the seller. Keep waiting, message the seller, or withdraw it.',
            title,
          })
        : t("notifications.offer_reminder.buyer_many", {
            defaultValue:
              "{{n}} of your offers are still waiting for the seller",
            n,
          })
      : notice.stage === "final"
        ? n === 1
          ? t("notifications.offer_reminder.final_one", {
              defaultValue:
                'Last reminder: an offer is waiting for your reply: "{{title}}"',
              title,
            })
          : t("notifications.offer_reminder.final_many", {
              defaultValue:
                "Last reminder: {{n}} offers are waiting for your reply",
              n,
            })
        : n === 1
          ? t("notifications.offer_reminder.first_one", {
              defaultValue: 'An offer is waiting for your reply: "{{title}}"',
              title,
            })
          : t("notifications.offer_reminder.first_many", {
              defaultValue: "{{n}} offers are waiting for your reply",
              n,
            })

  return (
    <NotificationBase
      icon={<HourglassBottomRoundedIcon />}
      to={ORDER_PATHS.offer(target.session_id)}
      notif={notif}
    >
      {text}
    </NotificationBase>
  )
}
