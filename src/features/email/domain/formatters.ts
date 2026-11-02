import i18n from "../../../util/i18n"

/** i18n keys for the notification action types the API sends. */
const ACTION_LABEL_KEYS: Record<string, string> = {
  // Order notifications
  order_create: "notifPrefsUi.actions.orderCreate",
  order_assigned: "notifPrefsUi.actions.orderAssigned",
  order_status_fulfilled: "notifPrefsUi.actions.orderStatusFulfilled",
  order_status_in_progress: "notifPrefsUi.actions.orderStatusInProgress",
  order_status_not_started: "notifPrefsUi.actions.orderStatusNotStarted",
  order_status_cancelled: "notifPrefsUi.actions.orderStatusCancelled",
  order_comment: "notifPrefsUi.actions.orderComment",
  order_message: "notifPrefsUi.actions.orderMessage",
  order_review: "notifPrefsUi.actions.orderReview",
  order_review_revision_requested:
    "notifPrefsUi.actions.orderReviewRevisionRequested",
  order_contractor_applied: "notifPrefsUi.actions.orderContractorApplied",

  // Market notifications
  market_item_bid: "notifPrefsUi.actions.marketItemBid",
  market_item_offer: "notifPrefsUi.actions.marketItemOffer",
  price_alert: "notifPrefsUi.actions.priceAlert",
  market_offer_accepted: "notifPrefsUi.actions.marketOfferAccepted",
  market_offer_declined: "notifPrefsUi.actions.marketOfferDeclined",

  // Offer notifications
  offer_create: "notifPrefsUi.actions.offerCreate",
  offer_message: "notifPrefsUi.actions.offerMessage",
  counter_offer_create: "notifPrefsUi.actions.counterOfferCreate",

  // Contractor notifications
  contractor_invite: "notifPrefsUi.actions.contractorInvite",

  // Admin notifications
  admin_alert: "notifPrefsUi.actions.adminAlert",
}

/**
 * Get user-friendly label for notification action type.
 * Called during render, so it follows the active language.
 */
export function formatActionName(actionName: string): string {
  if (!actionName) return i18n.t("notifPrefsUi.actions.unknown")

  const key = ACTION_LABEL_KEYS[actionName]
  if (key) return i18n.t(key)

  return actionName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
