import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded"
import { useTranslation } from "react-i18next"
import { Notification } from "../../../hooks/login/UserProfile"
import { NotificationBase } from "../components/NotificationBase"

/**
 * Entity of a listing_expiring notification (backend
 * services/listing-expiry noticeEntity): a shop's listings that expire in 3
 * days, and the one-click renew path (the seller's listings page renews
 * them on open).
 */
export interface ListingExpiryNotice {
  batch_id: string
  shop_slug: string
  shop_name: string
  renew_path: string
  listings: { listing_id: string; title: string; expires_at: string; status: string }[]
}

export function isListingExpiryNotice(entity: Notification["entity"] | undefined): entity is ListingExpiryNotice {
  return !!entity && typeof entity === "object" && "batch_id" in entity && "renew_path" in entity
}

/** "Still selling?": listings about to expire, with a one-click renew. */
export function NotificationListingExpiring(props: { notif: Notification }) {
  const { notif } = props
  const { t } = useTranslation()
  const notice = isListingExpiryNotice(notif.entity) ? notif.entity : null
  if (!notice) return null
  const count = notice.listings.length
  const text =
    count === 1
      ? t("notifications.listing_expiring.one", {
          defaultValue: "Still selling \"{{title}}\"? It expires in 3 days. Open to renew it in one click.",
          title: notice.listings[0].title,
        })
      : t("notifications.listing_expiring.many", {
          defaultValue: "Still selling? {{n}} listings in {{shop}} expire in 3 days. Open to renew them in one click.",
          n: count,
          shop: notice.shop_name,
        })

  return (
    <NotificationBase icon={<EventRepeatRoundedIcon />} to={notice.renew_path} notif={notif}>
      {text}
    </NotificationBase>
  )
}
