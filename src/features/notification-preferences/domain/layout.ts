import type { NotificationEventKey } from "../../../store/api/v2/market"

/** One row on the page: a group of events that share one set of channel pills. */
export interface NotificationRow {
  id: string
  label: string
  labelKey: string
  hint?: string
  hintKey?: string
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
): NotificationRow => ({
  id,
  label,
  labelKey: k(`rows.${id}.label`),
  ...(hint ? { hint, hintKey: k(`rows.${id}.hint`) } : {}),
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
        "A reminder when messages have been waiting for a day.",
        [
          row(
            "reminder",
            "Unread message reminder",
            ["reminder.unread_messages"],
            "At most once a day",
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
      section(
        "watchlist",
        "Price alerts",
        "A public listing reached the target price on your watchlist.",
        [row("price-alert", "Price alert", ["watchlist.price_alert"])],
        "price-alerts",
      ),
    ],
  },
  {
    id: "orgs",
    label: "Orgs & contracts",
    labelKey: k("tabs.orgs"),
    sections: [
      section("org", "Organizations", "Invitations to join an organization.", [
        row("invite", "Organization invite", ["org.invite"]),
      ]),
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
        "Messages from the SC Market team. Always delivered.",
        [row("admin", "Announcement", ["admin.alert"])],
      ),
    ],
  },
]
