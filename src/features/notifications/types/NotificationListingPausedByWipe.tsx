import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded"
import { useTranslation } from "react-i18next"
import { Notification } from "../../../hooks/login/UserProfile"
import { NotificationBase } from "../components/NotificationBase"
import { MARKET_PATHS } from "../../../routes/paths"

/**
 * Entity of a listing_paused_by_wipe notification (backend
 * services/listing-wipe wipeNoticeEntity): the wipe, and where the
 * "Relist all" banner is (My Listings).
 */
export interface WipeNotice {
  wipe_id: string
  ran_at: string
  relist_path: string
}

function isWipeNotice(
  entity: Notification["entity"] | undefined,
): entity is WipeNotice {
  return (
    !!entity &&
    typeof entity === "object" &&
    "wipe_id" in entity &&
    "relist_path" in entity
  )
}

/** "Your listings were paused for the wipe. Relist them in one tap." */
export function NotificationListingPausedByWipe(props: {
  notif: Notification
}) {
  const { notif } = props
  const { t } = useTranslation()
  const notice = isWipeNotice(notif.entity) ? notif.entity : null
  const to = notice?.relist_path.startsWith("/")
    ? notice.relist_path
    : MARKET_PATHS.myListings
  return (
    <NotificationBase icon={<RestartAltRoundedIcon />} to={to} notif={notif}>
      {t("notifications.listing_paused_by_wipe")}
    </NotificationBase>
  )
}
