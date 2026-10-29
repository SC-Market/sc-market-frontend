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
import { NotificationBidV2 } from "../types/NotificationBidV2"
import { NotificationPriceAlert } from "../types/NotificationPriceAlert"
import { NotificationPublicContract } from "../types/NotificationPublicContract"
import { NotificationOrgMemberJoined } from "../types/NotificationOrgMemberJoined"
import { NotificationOfferDecision } from "../types/NotificationOfferDecision"
import { NotificationAccountIdentity } from "../types/NotificationAccountIdentity"

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
    case "market_item_bid_v2":
      return <NotificationBidV2 notif={notif} />
    case "price_alert":
      return <NotificationPriceAlert notif={notif} />
    case "public_contract_create":
      return <NotificationPublicContract notif={notif} />
    case "admin_alert":
      return <NotificationAdminAlert notif={notif} />
    case "org_member_joined":
      return <NotificationOrgMemberJoined notif={notif} />
    case "offer_accepted":
    case "offer_rejected":
    case "contract_offer_received":
      return <NotificationOfferDecision notif={notif} />
    case "order_review_revision_requested":
      return <NotificationReviewRevisionRequest notif={notif} />
    case "account_identity_changed":
      return <NotificationAccountIdentity notif={notif} />
    default:
      return null
  }
}
