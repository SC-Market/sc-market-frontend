import type { NotificationEventKey } from "../../../store/api/v2/market"

/** One row on the page: a group of events that share one set of channel pills. */
export interface NotificationRow {
  id: string
  label: string
  labelKey: string
  hint?: string
  hintKey?: string
  /** A longer explanation behind a "?" next to the label. */
  tip?: string
  tipKey?: string
  events: NotificationEventKey[]
}

export interface NotificationSection {
  id: string
  label: string
  labelKey: string
  hint: string
  hintKey: string
  rows: NotificationRow[]
  /** Something shown under the section (price alert link, contract alert opt-in). */
  extra?: "price-alerts" | "contract-alerts"
}

export interface NotificationTab {
  id: "orders" | "messages" | "market" | "orgs" | "account"
  label: string
  labelKey: string
  sections: NotificationSection[]
}

const k = (path: string) => `settings.notifications.${path}`

const row = (
  id: string,
  label: string,
  events: NotificationEventKey[],
  hint?: string,
  tip?: string,
): NotificationRow => ({
  id,
  label,
  labelKey: k(`rows.${id}.label`),
  ...(hint ? { hint, hintKey: k(`rows.${id}.hint`) } : {}),
  ...(tip ? { tip, tipKey: k(`rows.${id}.tip`) } : {}),
  events,
})

const section = (
  id: string,
  label: string,
  hint: string,
  rows: NotificationRow[],
  extra?: NotificationSection["extra"],
): NotificationSection => ({
  id,
  label,
  labelKey: k(`sections.${id}.label`),
  hint,
  hintKey: k(`sections.${id}.hint`),
  rows,
  ...(extra ? { extra } : {}),
})

/** Tabs › sections › rows, as approved by the owner (drafts/notifications-settings-ux.md). */
export const NOTIFICATION_TABS: NotificationTab[] = [
  {
    id: "orders",
    label: "Orders & offers",
    labelKey: k("tabs.orders"),
    sections: [
      section(
        "new",
        "New orders and offers",
        "Someone orders from your shop or sends you an offer.",
        [
          row(
            "new-order",
            "New order",
            ["order.created"],
            "Orders for your shop, or assigned to you",
          ),
          row("new-offer", "New offer or counter-offer", [
            "offer.created",
            "offer.countered",
          ]),
        ],
      ),
      section(
        "updates",
        "Order and offer updates",
        "Changes on orders and offers you're part of.",
        [
          row(
            "status",
            "Status changes",
            [
              "order.status.in_progress",
              "order.status.fulfilled",
              "order.status.cancelled",
              "order.status.not_started",
            ],
            "In progress, fulfilled, cancelled",
          ),
          row("assigned", "Assigned to you", ["order.assigned"]),
          row("decisions", "Offer accepted or rejected", [
            "offer.accepted",
            "offer.rejected",
          ]),
        ],
      ),
      section("reviews", "Reviews", "New reviews and revision requests.", [
        row("review", "New review", ["order.review"]),
        row("revision", "Review revision requested", [
          "order.review_revision_requested",
        ]),
      ]),
      section(
        "threads",
        "Discord threads",
        "Your order and offer threads on a seller's Discord server.",
        [
          row(
            "thread-invite",
            "Invite to the Discord server",
            ["order.thread_invite"],
            "When the bot can't add you to an order or offer thread",
            "The bot opens a private thread for each order or offer on the seller's Discord server. If it can't add you (usually because you're not in that server yet), it DMs you an invite to the server.",
          ),
        ],
      ),
    ],
  },
  {
    id: "messages",
    label: "Messages",
    labelKey: k("tabs.messages"),
    sections: [
      section("chats", "Messages", "New messages in order and offer chats.", [
        row("order-messages", "Order messages", ["order.message"]),
        row("offer-messages", "Offer messages", ["offer.message"]),
      ]),
      section(
        "reminders",
        "Reminders",
        "A reminder when messages have been waiting a few hours, or an offer is waiting for a reply.",
        [
          row(
            "reminder",
            "Unread message reminder",
            ["reminder.unread_messages"],
            "At most once a day",
            "When a message in one of your order or offer chats has been unread for about 6 hours, we remind you so the other side isn't left waiting.",
          ),
          row(
            "offer-pending",
            "Offer waiting for your reply",
            ["reminder.offer_pending", "reminder.offer_pending_final"],
            "About 1 and 3 days after an offer arrives with no reply",
            "When an offer to you, or to an org whose orders you handle, has no answer yet. Accept, counter or reject it to stop the reminders.",
          ),
          row(
            "offer-waiting",
            "Your offer is still waiting",
            ["reminder.offer_waiting_buyer"],
            "If the seller hasn't replied after the last reminder",
            "For offers you made as a buyer: the seller still hasn't answered after being reminded. You can keep waiting, message the seller or withdraw the offer.",
          ),
        ],
      ),
    ],
  },
  {
    id: "market",
    label: "Market & watchlist",
    labelKey: k("tabs.market"),
    sections: [
      section("bids", "Bids", "New bids on your auctions.", [
        row("bid", "New bid", ["market.bid"]),
      ]),
      // Listings: the message after a game wipe (listing.paused_by_wipe). The
      // expiry reminder (listing.expiring) joins this section when
      // LISTING_EXPIRY_ENABLED is turned on on the backend.
      section("listings", "Listings", "A game wipe paused your listings.", [
        row(
          "wipe-relist",
          "Paused by a wipe",
          ["listing.paused_by_wipe"],
          "One message after a wipe, with a one-tap relist",
        ),
      ]),
      section(
        "watchlist",
        "Price alerts",
        "A public listing reached the target price on your watchlist.",
        [row("price-alert", "Price alert", ["watchlist.price_alert"])],
        "price-alerts",
      ),
      section(
        "buy-orders",
        "Buy orders",
        "A new public listing matches one of your buy orders, or a seller fills one.",
        [
          row("buy-order-match", "Buy-order match", ["buy_order.match"]),
          row(
            "buy-order-filled",
            "Buy order filled",
            ["buy_order.filled"],
            "A seller filled your buy order and an order was created",
          ),
        ],
      ),
    ],
  },
  {
    id: "orgs",
    label: "Orgs & contracts",
    labelKey: k("tabs.orgs"),
    sections: [
      section(
        "org",
        "Organizations",
        "Invitations to join an organization, and members joining yours.",
        [
          row("invite", "Organization invite", ["org.invite"]),
          row(
            "member-joined",
            "New member joined",
            ["org.member_joined"],
            "Orgs where you can manage invites",
          ),
        ],
      ),
      section(
        "contracts",
        "Public contracts",
        "Offers on your public contracts, and new public contracts if you opt in below.",
        [
          row("contract-offer", "Offer on your contract", [
            "contract.offer_received",
          ]),
          row(
            "contract-new",
            "New public contract",
            ["contract.public_created"],
            "Only if you turn alerts on below",
          ),
        ],
        "contract-alerts",
      ),
      section(
        "storefront",
        "Storefront enquiries",
        "Replies to a branded storefront enquiry you sent.",
        [
          row("storefront-enquiry", "Enquiry accepted or declined", [
            "storefront.enquiry_accepted",
            "storefront.enquiry_declined",
          ]),
        ],
      ),
    ],
  },
  {
    id: "account",
    label: "Account",
    labelKey: k("tabs.account"),
    sections: [
      section(
        "announcements",
        "Announcements",
        "Messages from the SC Market team. Always delivered on the site, push and Discord; you can turn the emails off.",
        [row("admin", "Announcement", ["admin.alert"])],
      ),
    ],
  },
]
