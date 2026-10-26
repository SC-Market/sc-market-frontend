/**
 * Every guide the app links to from a page ("Learn how", HelpLink). One
 * registry so routes.contentLinks.test can check each target is a real guide
 * (and anchor). Plain strings on purpose: importing the compiled content here
 * would pull every guide into the pages that show a link.
 */
export const GUIDE_LINKS = {
  createAccount: "/guides/getting-started/create-an-account",
  buyAnItem: "/guides/buying/buy-an-item",
  postBuyOrder: "/guides/buying/buy-an-item#post-a-buy-order",
  howOrdersWork: "/guides/buying/how-orders-work",
  handleOrders: "/guides/selling/handle-orders-as-a-seller",
  sellItems: "/guides/selling/sell-items",
  auctions: "/guides/selling/auctions",
  fillBuyOrder: "/guides/selling/fill-a-buy-order",
  stockLots: "/guides/selling/stock-lots-and-allocation",
  connectDiscordBot: "/guides/discord/connect-the-discord-bot",
  orderAlerts: "/guides/discord/order-alerts-and-claiming",
  webhooks: "/guides/discord/webhooks",
  orgRoles: "/guides/orgs/roles-and-permissions",
  orgInvites: "/guides/orgs/invite-and-manage-members",
  orgAuditLogs: "/guides/orgs/audit-logs",
  orgWhiteLabelTheme: "/guides/org-storefront/white-label-theme",
  orgRecruiting: "/guides/org-storefront/recruiting",
  orgShop: "/guides/org-storefront/org-shop",
  tradeSafely: "/guides/getting-started/trade-safely",
} as const

export type GuideLink = keyof typeof GUIDE_LINKS
