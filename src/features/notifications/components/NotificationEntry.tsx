import { Notification } from "../../../hooks/login/UserProfile"
import {
  NotificationOrderCreate,
  NotificationOfferCreate,
  NotificationOfferMessage,
  NotificationOrderComment,
  NotificationOrderReview,
  NotificationOrderMessage,
  NotificationOrderUpdateStatus,
  NotificationBid,
  NotificationAdminAlert,
  NotificationReviewRevisionRequest,
  NotificationContractorInvite,
} from "../types"

export function NotificationEntry(props: { notif: Notification }) {
  const { notif } = props
  switch (notif.action) {
    case "order_create":
      return <NotificationOrderCreate notif={notif} />
    case "offer_create":
    case "counter_offer_create":
      return <NotificationOfferCreate notif={notif} />
    case "offer_message":
      return <NotificationOfferMessage notif={notif} />
    case "contractor_invite":
      return <NotificationContractorInvite notif={notif} />
    case "order_assigned":
      return <NotificationOrderCreate notif={notif} />
    case "order_comment":
      return <NotificationOrderComment notif={notif} />
    case "order_review":
      return <NotificationOrderReview notif={notif} />
    case "order_message":
      return <NotificationOrderMessage notif={notif} />
    case "order_status_fulfilled":
    case "order_status_in_progress":
    case "order_status_not_started":
    case "order_status_cancelled":
      return <NotificationOrderUpdateStatus notif={notif} />
    case "market_item_bid":
      return <NotificationBid notif={notif} />
    case "admin_alert":
      return <NotificationAdminAlert notif={notif} />
    case "order_review_revision_requested":
      return <NotificationReviewRevisionRequest notif={notif} />
    default:
      return null
  }
}
